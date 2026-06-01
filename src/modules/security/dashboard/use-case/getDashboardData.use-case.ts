import { Audit } from '@/modules/security/audit/entities/audit.entity';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { LoggerService } from '@/services/logger.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn } from 'sequelize';
import { UserRepository } from '../../user/repository/user.repository';
import {
	DashboardResponseDTO,
	UsersByRoleDTO,
} from '../dto/dashboard.dto';

@Injectable()
export class GetDashboardDataUseCase {
	private readonly logger = new Logger(GetDashboardDataUseCase.name);

	constructor(
		@InjectModel(Audit)
		private readonly auditModel: typeof Audit,
		private readonly userRepository: UserRepository,
		private readonly loggerService: LoggerService,
	) {}

	async execute({ dataLog }: { dataLog: string }): Promise<DashboardResponseDTO> {
		this.logger.log(`${dataLog} - Obteniendo datos del dashboard`);

		try {
			const [
				totalUsers,
				activeUsers,
				inactiveUsers,
				activatedAccounts,
				pendingAccounts,
				usersByRole,
				activeUsersSessions,
			] = await Promise.all([
				this.userRepository.count({}),
				this.userRepository.count({ where: { status: true } }),
				this.userRepository.count({ where: { status: false } }),
				this.userRepository.count({ where: { activatedAccount: true } }),
				this.userRepository.count({ where: { activatedAccount: false } }),
				this.getUsersByRole(),
				this.getActiveUsers(),
			]);

			this.loggerService.logMetric('dashboard.consultado', 1);

			return {
				totalUsers,
				usersByStatus: { active: activeUsers, inactive: inactiveUsers },
				usersByActivation: { activated: activatedAccounts, pending: pendingAccounts },
				usersByRole,
				activeUsers: activeUsersSessions,
			};
		} catch (error) {
			const err = error as Error;
			this.logger.error(
				`${dataLog} - Error obteniendo datos del dashboard: ${err.message}`,
				err.stack,
			);
			throw error;
		}
	}

	private async getUsersByRole(): Promise<UsersByRoleDTO[]> {
		const result = await this.userRepository.findAllWithOptions({
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

		return result.map(row => {
			const data = row as unknown as {
				uidRol: string;
				count: number;
				'rol.name': string;
			};
			return {
				rolName: data['rol.name'] ?? 'Unknown',
				count: data.count,
			};
		});
	}

	private async getActiveUsers(): Promise<number> {
		const count = await this.auditModel.count({
			distinct: true,
			col: 'uidUser',
		});

		return count;
	}
}
