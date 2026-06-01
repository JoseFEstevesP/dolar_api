import { Order } from '@/constants/dataConstants';
import { booleanStatus } from '@/functions/booleanStatus';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { LoggerService } from '@/services/logger.service';
import { PaginationResult } from '@/types';
import { Injectable } from '@nestjs/common';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { Permission } from '../../rol/enum/permissions';
import { UserGetAllDTO } from '../dto/userGetAll.dto';
import { User } from '../entities/user.entity';
import { OrderUserProperty } from '../enum/orderProperty';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class FindAllUsersUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly logger: LoggerService,
	) {}

	async execute({
		filter,
		uidUser,
		dataLog,
	}: {
		filter: UserGetAllDTO;
		uidUser: string;
		dataLog: string;
	}): Promise<PaginationResult<User>> {
		const {
			limit = 30,
			page = 1,
			orderProperty = OrderUserProperty.email,
			search,
			status: olStatus,
			order = Order.ASC,
		} = filter;

		const status = booleanStatus({ status: olStatus ?? 'true' }) ?? true;
		const parsedLimit = Math.min(Number(limit), 100);
		const parsedPage = Math.max(Number(page), 1);

		const where = this.buildWhereClause(uidUser, status, search);
		const queryOptions = this.buildQueryOptions(
			where,
			orderProperty,
			order,
			parsedLimit,
			parsedPage,
		);

		const { rows, count } =
			await this.userRepository.findAndCountAll(queryOptions);

		const pagination = this.calculatePagination(count, parsedLimit, parsedPage);

		this.logger.info(`${dataLog} - ${userMessages.log.findAllSuccess}`, {
			type: 'user_find_all',
			total: count,
			page: parsedPage,
			limit: parsedLimit,
		});

		this.logger.logMetric('usuario.buscar_todos', count);

		const formattedRows = this.formateRows(rows);
		const result = {
			...formattedRows,
			...pagination,
		} as unknown as PaginationResult<User>;

		return result;
	}

	private buildWhereClause(
		uidUser: string,
		status: boolean,
		search?: string,
	): WhereOptions<User> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const where: any = {
			status,
			uid: { [Op.ne]: uidUser },
		};

		if (search) {
			where[Op.or] = [
				{ names: { [Op.iLike]: `%${search}%` } },
				{ surnames: { [Op.iLike]: `%${search}%` } },
				{ email: { [Op.iLike]: `%${search}%` } },
				{ phone: { [Op.iLike]: `%${search}%` } },
			];
		}

		return where;
	}

	private buildQueryOptions(
		where: WhereOptions<User>,
		orderProperty: OrderUserProperty,
		order: Order,
		limit: number,
		page: number,
	): FindAndCountOptions<User> {
		return {
			where,
			attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
			limit,
			offset: (page - 1) * limit,
			order: [[orderProperty, order]],
			include: [
				{
					model: Role,
					attributes: ['uid', 'name', 'permissions'],
				},
			],
		};
	}

	private formateRows(rows: User[]) {
		return {
			rows: rows.map(user => {
				const userJson = user.toJSON() as unknown as Record<string, unknown>;
				const rol = userJson.rol as Role | undefined;
				if (rol) {
					userJson.rol = {
						uid: rol.uid,
						name: rol.name,
						permissions: rol.permissions as Permission[],
					};
				}
				return userJson;
			}),
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
			count: totalItems,
			currentPage: adjustedPage,
			nextPage: adjustedPage + 1 <= totalPages ? adjustedPage + 1 : null,
			previousPage: adjustedPage - 1 > 0 ? adjustedPage - 1 : null,
			limit,
			pages: totalPages,
		};
	}
}
