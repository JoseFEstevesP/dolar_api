import { Order } from '@/constants/dataConstants';
import { LoggerService } from '@/services/logger.service';
import { PaginationResult } from '@/types';
import { Injectable } from '@nestjs/common';
import {
	FindAndCountOptions,
	Includeable,
	Op,
	OrderItem,
	WhereOptions,
} from 'sequelize';
import { User } from '@/modules/security/user/entities/user.entity';
import { auditMessages } from '../audit.messages';
import { AuditGetAllDTO } from '../dto/auditGetAll.dto';
import { Audit } from '../entities/audit.entity';
import { OrderAuditProperty } from '../enum/orderProperty';
import { AuditRepository } from '../repository/audit.repository';

@Injectable()
export class FindAllAuditsUseCase {
	constructor(
		private readonly auditRepository: AuditRepository,
		private readonly logger: LoggerService,
	) {}

	async execute({
		filter,
		uidUser,
		dataLog,
	}: {
		filter: AuditGetAllDTO;
		uidUser: string;
		dataLog: string;
	}): Promise<PaginationResult<Audit>> {
		const {
			limit = 30,
			page = 1,
			search,
			orderProperty = OrderAuditProperty.names,
			order = Order.ASC,
		} = filter;

		const parsedLimit = Math.min(Number(limit), 100);
		const parsedPage = Math.max(Number(page), 1);

		const where = this.buildWhereClause(uidUser, search);
		const queryOptions = this.buildQueryOptions(
			where,
			orderProperty,
			order,
			parsedLimit,
			parsedPage,
		);

		const { rows, count } =
			await this.auditRepository.findAndCountAll(queryOptions);

		const pagination = this.calculatePagination(count, parsedLimit, parsedPage);

		const result = {
			rows,
			count,
			...pagination,
		};

		this.logger.info(`${dataLog} - ${auditMessages.log.findAllSuccess}`, {
			type: 'audit_find_all',
			total: count,
			page: parsedPage,
			limit: parsedLimit,
		});

		this.logger.logMetric('auditoria.buscar_todos', count);

		return result;
	}

	private buildWhereClause(uidUser: string, search?: string): WhereOptions {
		const where: WhereOptions = {
			uid: { [Op.ne]: uidUser },
		} as WhereOptions;

		if (search) {
			(where as Record<string, unknown>)['$or'] =
				this.getSearchConditions(search);
		}

		return where;
	}

	private getSearchConditions(search: string): WhereOptions[] {
		const searchableFields = [
			'$user.names',
			'$user.surnames',
			'ip',
			'userAgent',
			'userPlatform',
		];

		return searchableFields.map(field => ({
			[field]: { [Op.iLike]: `%${search}%` },
		}));
	}

	private buildQueryOptions(
		where: WhereOptions,
		orderProperty: OrderAuditProperty,
		order: Order,
		limit: number,
		page: number,
	): FindAndCountOptions<Audit> {
		return {
			where,
			include: this.getIncludeOptions(),
			attributes: {
				exclude: this.getExcludedAttributes(),
			},
			limit,
			offset: (page - 1) * limit,
			order: this.getOrder(orderProperty, order),
		};
	}

	private getIncludeOptions(): Includeable[] {
		return [
			{
				model: User,
				required: true,
				attributes: ['names', 'surnames'],
			},
		];
	}

	private getExcludedAttributes(): string[] {
		return ['updatedAt', 'refreshToken'];
	}

	private calculatePagination(
		totalItems: number,
		limit: number,
		currentPage: number,
	) {
		const totalPages = Math.ceil(totalItems / limit);
		const adjustedPage = currentPage > totalPages ? totalPages : currentPage;

		return {
			currentPage: adjustedPage,
			nextPage: adjustedPage + 1 <= totalPages ? adjustedPage + 1 : null,
			previousPage: adjustedPage - 1 > 0 ? adjustedPage - 1 : null,
			limit,
			pages: totalPages,
		};
	}

	private getOrder(orderProperty: OrderAuditProperty, direction: Order) {
		const orderMap: Record<OrderAuditProperty, unknown[]> = {
			names: ['user', 'names', direction],
			surnames: ['user', 'surnames', direction],
			ip: ['ip', direction],
			userAgent: ['userAgent', direction],
			userPlatform: ['userPlatform', direction],
		};

		return [orderMap[orderProperty] as OrderItem];
	}
}