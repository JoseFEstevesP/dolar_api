import { LoggerService } from '@/services/logger.service';
import { Injectable, Logger } from '@nestjs/common';
import { fn, col } from 'sequelize';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';
import {
	UserChartDataResponseDTO,
	UsersByStatusDTO,
	UsersByActivationDTO,
	UsersByRoleDTO,
} from '../dto/userChartData.dto';

@Injectable()
export class GetUserChartsUseCase {
	private readonly logger = new Logger(GetUserChartsUseCase.name);

	constructor(
		private readonly userRepository: UserRepository,
		private readonly loggerService: LoggerService,
	) {}

	async execute({
		dataLog,
	}: {
		dataLog: string;
	}): Promise<UserChartDataResponseDTO> {
		this.logger.log(`${dataLog} - ${userMessages.log.charts}`);

		try {
			const [usersByStatus, usersByActivation, usersByRole] = await Promise.all(
				[
					this.getUsersByStatus(),
					this.getUsersByActivation(),
					this.getUsersByRole(),
				],
			);

			this.logger.log(`${dataLog} - ${userMessages.log.chartsSuccess}`);

			this.loggerService.logMetric('usuario.graficos', 1);

			return {
				usersByStatus,
				usersByActivation,
				usersByRole,
			};
		} catch (error) {
			const err = error as Error;
			this.logger.error(
				`${dataLog} - Error obteniendo gráficos de usuarios: ${err.message}`,
				err.stack,
			);
			throw error;
		}
	}

	private async getUsersByStatus(): Promise<UsersByStatusDTO> {
		const active = await this.userRepository.count({
			where: { status: true },
		});

		const inactive = await this.userRepository.count({
			where: { status: false },
		});

		return { active, inactive };
	}

	private async getUsersByActivation(): Promise<UsersByActivationDTO> {
		const activated = await this.userRepository.count({
			where: { activatedAccount: true },
		});

		const pending = await this.userRepository.count({
			where: { activatedAccount: false },
		});

		return { activated, pending };
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
}
