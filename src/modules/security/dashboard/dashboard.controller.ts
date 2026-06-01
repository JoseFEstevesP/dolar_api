import { Auth } from '@/decorators/auth.decorator';
import { ReqUidDTO } from '@/dto/ReqUid.dto';
import { Permission } from '@/modules/security/rol/enum/permissions';
import { Controller, Get, Logger, Req } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardResponseDTO } from './dto/dashboard.dto';
import { GetDashboardDataUseCase } from './use-case/getDashboardData.use-case';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
	private readonly logger = new Logger(DashboardController.name);

	constructor(
		private readonly getDashboardDataUseCase: GetDashboardDataUseCase,
	) {}

	@Auth(Permission.dashboardRead)
	@ApiResponse({
		status: 200,
		description: 'Datos del dashboard obtenidos correctamente',
		type: DashboardResponseDTO,
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@Get()
	async getDashboard(@Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - Obteniendo datos del dashboard`);

		return this.getDashboardDataUseCase.execute({ dataLog });
	}
}
