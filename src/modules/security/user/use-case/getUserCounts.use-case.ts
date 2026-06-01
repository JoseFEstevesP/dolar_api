import { Injectable, Logger } from '@nestjs/common';
import { col, fn, WhereOptions } from 'sequelize';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repository/user.repository';

export interface UsersByRoleDTO {
	rolName: string;
	count: number;
}

@Injectable()
export class GetUserCountsUseCase {
	private readonly logger = new Logger(GetUserCountsUseCase.name);

	constructor(private readonly userRepository: UserRepository) {}

	async countUsers(where?: WhereOptions<User>): Promise<number> {
		return this.userRepository.count({ ...(where && { where }) });
	}

	async countUsersByRole(): Promise<UsersByRoleDTO[]> {
		const result = await this.userRepository.findAllWithOptions<{
			uidRol: string;
			count: number;
			'rol.name': string;
		}>({
			attributes: ['uidRol', [fn('count', col('User.uid')), 'count']],
			include: [
				{
					model: Role,
					as: 'rol',
					attributes: ['name'],
					required: true,
				},
			],
			group: ['User.uidRol', 'rol.uid'],
			raw: true,
		});

		return result.map(row => ({
			rolName: row['rol.name'] ?? 'Unknown',
			count: row.count,
		}));
	}
}
