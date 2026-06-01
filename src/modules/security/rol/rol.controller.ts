import { Auth, AuthPublic } from '@/decorators/auth.decorator';
import { ReqUidDTO } from '@/dto/ReqUid.dto';
import { UidDTO } from '@/dto/uid.dto';
import {
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	Param,
	Patch,
	Post,
	Query,
	Req,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolGetAllDTO } from './dto/rolGetAll.dto';
import { RolRegisterDTO } from './dto/rolRegister.dto';
import { RolUpdateDTO } from './dto/rolUpdate.dto';
import { Role } from './entities/rol.entity';
import { Permission } from './enum/permissions';
import { rolMessages } from './rol.messages';
import { CreateRolUseCase } from './use-case/createRol.use-case';
import { FindAllRolsUseCase } from './use-case/findAllRols.use-case';
import { FindAllRolsPaginationUseCase } from './use-case/findAllRolsPagination.use-case';
import { FindOneRolUseCase } from './use-case/findOneRol.use-case';
import { FindRolPermissionsUseCase } from './use-case/findRolPermissions.use-case';
import { RemoveRolUseCase } from './use-case/removeRol.use-case';
import { UpdateRolUseCase } from './use-case/updateRol.use-case';

@ApiTags('Rol')
@Controller('rol')
export class RolController {
	private readonly logger = new Logger(RolController.name);

	constructor(
		private readonly createRolUseCase: CreateRolUseCase,
		private readonly findOneRolUseCase: FindOneRolUseCase,
		private readonly findRolPermissionsUseCase: FindRolPermissionsUseCase,
		private readonly findAllRolsPaginationUseCase: FindAllRolsPaginationUseCase,
		private readonly findAllRolsUseCase: FindAllRolsUseCase,
		private readonly updateRolUseCase: UpdateRolUseCase,
		private readonly removeRolUseCase: RemoveRolUseCase,
	) {}

	@Auth(Permission.rolAdd)
	@ApiResponse({
		status: 201,
		description: 'Rol creado correctamente',
		type: Role,
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@Post()
	async register(@Body() data: RolRegisterDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${rolMessages.log.controller.create}`);

		return this.createRolUseCase.execute({ data, dataLog });
	}

	@Auth(Permission.rolReadOne)
	@ApiResponse({
		status: 200,
		description: 'Rol encontrado',
		type: Role,
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Rol no encontrado' })
	@Get('/one/:uid')
	async findOne(@Param() data: UidDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${rolMessages.log.controller.findOne}`);

		return this.findOneRolUseCase.execute({ uid: data.uid }, dataLog);
	}

	@AuthPublic()
	@ApiResponse({
		status: 200,
		description: 'Permisos del rol',
		type: [String],
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@Get('/per')
	async findPer(@Req() req: ReqUidDTO) {
		const { dataLog, uidRol } = req.user;
		this.logger.log(`${dataLog} - ${rolMessages.log.controller.findOne}`);

		return this.findRolPermissionsUseCase.execute({ uid: uidRol, dataLog });
	}

	@Auth(Permission.rolRead)
	@ApiResponse({
		status: 200,
		description: 'Roles encontrados',
		type: [Role],
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@Get()
	async findAllPagination(
		@Query() filter: RolGetAllDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${rolMessages.log.controller.findAll}`);

		return this.findAllRolsPaginationUseCase.execute({ filter, dataLog });
	}

	@AuthPublic()
	@ApiResponse({
		status: 200,
		description: 'Roles encontrados',
		type: [Role],
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@Get('/all')
	async findAll(@Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${rolMessages.log.controller.findAll}`);

		return this.findAllRolsUseCase.execute({ dataLog });
	}

	@Auth(Permission.rolUpdate)
	@ApiResponse({
		status: 200,
		description: 'Rol actualizado correctamente',
		type: Role,
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Rol no encontrado' })
	@Patch()
	async update(@Body() data: RolUpdateDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${rolMessages.log.controller.update}`);

		return this.updateRolUseCase.execute({ data, dataLog });
	}

	@Auth(Permission.rolDelete)
	@ApiResponse({
		status: 200,
		description: 'Rol eliminado correctamente',
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: 'Rol no encontrado' })
	@Delete('/delete/:uid')
	async delete(@Param() data: UidDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${rolMessages.log.controller.remove}`);

		return this.removeRolUseCase.execute({ uid: data.uid, dataLog });
	}
}
