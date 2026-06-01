import { Auth } from '@/decorators/auth.decorator';
import { ReqUidDTO } from '@/dto/ReqUid.dto';
import { Permission } from '@/modules/security/rol/enum/permissions';
import {
	Controller,
	Delete,
	Get,
	Logger,
	Param,
	Query,
	Req,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditGetAllDTO } from './dto/auditGetAll.dto';
import { auditMessages } from './audit.messages';
import { FindAllAuditsUseCase } from './use-case/findAllAudits.use-case';
import { RemoveAuditUseCase } from './use-case/removeAudit.use-case';
import { Audit } from './entities/audit.entity';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
	private readonly logger = new Logger(AuditController.name);

	constructor(
		private readonly findAllAuditsUseCase: FindAllAuditsUseCase,
		private readonly removeAuditUseCase: RemoveAuditUseCase,
	) {}

	@Auth(Permission.auditRead)
	@ApiResponse({
		status: 200,
		description: 'Auditorias encontradas',
		type: [Audit],
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@Get()
	async findAllPagination(
		@Query() filter: AuditGetAllDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog, uid } = req.user;
		this.logger.log(`${dataLog} - ${auditMessages.log.controller.findAll}`);

		return this.findAllAuditsUseCase.execute({
			filter,
			uidUser: uid,
			dataLog,
		});
	}

	@Auth(Permission.auditDelete)
	@ApiResponse({
		status: 200,
		description: 'Auditoria eliminada correctamente',
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Not Found' })
	@Delete('/delete/:uid')
	async delete(@Param('uid') uid: string, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${auditMessages.log.controller.remove}`);

		return this.removeAuditUseCase.execute({ uid }, dataLog);
	}
}
