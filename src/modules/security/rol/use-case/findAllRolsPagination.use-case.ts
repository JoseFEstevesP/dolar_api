import { Order } from '@/constants/dataConstants';
import { booleanStatus } from '@/functions/booleanStatus';
import { LoggerService } from '@/services/logger.service';
import { PaginationResult } from '@/types';
import { Injectable } from '@nestjs/common';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { RolGetAllDTO } from '../dto/rolGetAll.dto';
import { Role } from '../entities/rol.entity';
import { OrderRolProperty } from '../enum/orderProperty';
import { RolRepository } from '../repository/rol.repository';
import { rolMessages } from '../rol.messages';

@Injectable()
export class FindAllRolsPaginationUseCase {
	constructor(
		private readonly rolRepository: RolRepository,
		private readonly logger: LoggerService,
	) {}

	async execute({
		filter,
		dataLog,
	}: {
		filter: RolGetAllDTO;
		dataLog: string;
	}): Promise<PaginationResult<Role>> {
		const {
			limit = 30,
			page = 1,
			search,
			status: olStatus,
			orderProperty = OrderRolProperty.name,
			order = Order.ASC,
			permission,
		} = filter;

		const status =
			olStatus === undefined
				? undefined
				: (booleanStatus({ status: olStatus }) ?? true);
		const parsedLimit = Math.min(Number(limit), 100);
		const parsedPage = Math.max(Number(page), 1);

		const where = this.buildWhereClause(status, search, permission);
		const queryOptions = this.buildQueryOptions(
			where,
			orderProperty,
			order,
			parsedLimit,
			parsedPage,
		);

		const { rows, count } =
			await this.rolRepository.findAndCountAll(queryOptions);

		const result = {
			rows,
			count,
			...this.calculatePagination(count, parsedLimit, parsedPage),
		};

		this.logger.log(`${dataLog} - ${rolMessages.log.findAllSuccess}`);

		return result;
	}

	private buildWhereClause(
		status: boolean | undefined,
		search?: string,
		permission?: string,
	): WhereOptions<Role> {
		const where: WhereOptions<Role> = {};

		if (status !== undefined) {
			where.status = status;
		}

		if (search || permission) {
			const orConditions: WhereOptions<Role>[] = [];

			if (search) {
				orConditions.push({ name: { [Op.iLike]: `%${search}%` } });
			}

			if (permission) {
				const permissionArray = Array.isArray(permission)
					? permission
					: [permission];
				orConditions.push({ permissions: { [Op.overlap]: permissionArray } });
			}

			return {
				...where,
				[Op.or]: orConditions,
			} as WhereOptions<Role>;
		}

		return where;
	}

	private buildQueryOptions(
		where: WhereOptions<Role>,
		orderProperty: OrderRolProperty,
		order: Order,
		limit: number,
		page: number,
	): FindAndCountOptions<Role> {
		return {
			where,
			attributes: {
				exclude: ['createdAt', 'updatedAt'],
			},
			limit,
			offset: (page - 1) * limit,
			order: [[orderProperty, order]],
		};
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
}