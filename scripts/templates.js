export const TEMPLATES = {
	// Archivo [moduleName].messages.ts - basado en rol.messages.ts
	messages: (
		moduleName,
		capitalizedName,
	) => `export const ${moduleName}Messages = {
  // General messages
  findOne: 'No se ha encontrado ningún ${moduleName}',
  findUserExit: 'No se puede eliminar ya que un usuario está asignado a este ${moduleName}',
  register: '${capitalizedName} registrado exitosamente',
  update: '${capitalizedName} actualizado exitosamente',
  delete: '${capitalizedName} eliminado',
  credential: 'Credenciales no válidas.',
  ${moduleName}Error: '${capitalizedName} no encontrado.',
  relationError: 'El ${moduleName} está relacionado con otros datos',

  // Validation messages
  validation: {
    disability: 'Este ${moduleName} ya está registrado, pero está deshabilitado',
    default: 'Este ${moduleName} ya está registrado',
    dto: {
      status: 'Este campo debe ser un booleano',
      empty: 'Este campo no puede estar vacío',
      defined: 'Este campo no está definido',
      stringValue: 'Este campo debe ser de tipo cadena de texto',
      enumValue: 'Valor no válido',
      lengthValue: 'Este campo debe tener entre 3 y 255 caracteres',
      uid: {
        valid: 'El campo UID no es un UUID válido',
        empty: 'El campo UID no puede estar vacío',
      },
    },
  },

  // Log messages
  log: {
    create: 'Creando ${moduleName}',
    createAut: 'Creando ${moduleName} automático',
    createAutProcess: 'Proceso para crear ${moduleName} automático',
    createAutVerify: 'Verificando existencia de ${moduleName} automático',
    createAutSuccess: '${capitalizedName} automático creado exitosamente',
    createSuccess: '${capitalizedName} creado exitosamente',
    errorValidator: 'Falló la validación',
    ${moduleName}Error: '${capitalizedName} no encontrado',
    findOne: 'Encontrar ${moduleName} con UID',
    findOneSuccess: '${capitalizedName} encontrado exitosamente',
    findAll: 'Encontrar o buscar ${moduleName}',
    findAllSuccess: '${capitalizedName} encontrado o buscado exitosamente',
    update: 'Actualizar ${moduleName}',
    updateSuccess: '${capitalizedName} actualizado exitosamente',
    remove: 'Eliminar ${moduleName}',
    removeSuccess: '${capitalizedName} eliminado exitosamente',
    controller: {
      create: 'Registrando nuevo ${moduleName} en el controlador con datos',
      login: 'Controlador de inicio de sesión de ${moduleName} con datos',
      findOne: 'Encontrar controlador de ${moduleName} con UID',
      findAll: 'Encontrar o buscar controlador de ${moduleName}',
      valError: 'Error de validación del ${moduleName}',
      update: 'Actualizar controlador de ${moduleName}',
      remove: 'Eliminar controlador de ${moduleName}',
    },
  },
};
`,

	// Controlador - basado en rol.controller.ts
	controller: (moduleName, capitalizedName) => `
import { ReqUidDTO } from '@/dto/ReqUid.dto';
import { UidDTO } from '@/dto/uid.dto';
import { JwtAuthGuard } from '@/modules/security/auth/guards/jwtAuth.guard';
import { Permission } from '@/modules/security/rol/enum/permissions';
import { ValidPermission } from '@/modules/security/valid-permission/validPermission.decorator';
import { PermissionsGuard } from '@/modules/security/valid-permission/validPermission.guard';
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
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ${capitalizedName}GetAllDTO } from './dto/${moduleName}GetAll.dto';
import { ${capitalizedName}RegisterDTO } from './dto/${moduleName}Register.dto';
import { ${capitalizedName}UpdateDTO } from './dto/${moduleName}Update.dto';
import { ${capitalizedName} } from './entities/${moduleName}.entity';
import { ${moduleName}Messages } from './${moduleName}.messages';
import { Create${capitalizedName}UseCase } from './use-case/create${capitalizedName}.use-case';
import { FindAll${capitalizedName}sUseCase } from './use-case/findAll${capitalizedName}s.use-case';
import { FindAll${capitalizedName}sPaginationUseCase } from './use-case/findAll${capitalizedName}sPagination.use-case';
import { FindOne${capitalizedName}UseCase } from './use-case/findOne${capitalizedName}.use-case';
import { Remove${capitalizedName}UseCase } from './use-case/remove${capitalizedName}.use-case';
import { Update${capitalizedName}UseCase } from './use-case/update${capitalizedName}.use-case';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('${capitalizedName}')
@Controller('${moduleName}')
export class ${capitalizedName}Controller {
	private readonly logger = new Logger(${capitalizedName}Controller.name);

	constructor(
		private readonly create${capitalizedName}UseCase: Create${capitalizedName}UseCase,
		private readonly findOne${capitalizedName}UseCase: FindOne${capitalizedName}UseCase,
		private readonly findAll${capitalizedName}sUseCase: FindAll${capitalizedName}sUseCase,
		private readonly findAll${capitalizedName}sPaginationUseCase: FindAll${capitalizedName}sPaginationUseCase,
		private readonly update${capitalizedName}UseCase: Update${capitalizedName}UseCase,
		private readonly remove${capitalizedName}UseCase: Remove${capitalizedName}UseCase,
	) {}

	@ApiResponse({
		status: 201,
		description: '${capitalizedName} creado correctamente',
		type: ${capitalizedName},
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ValidPermission(Permission.${moduleName}Add)
	@Post()
	async register(@Body() data: ${capitalizedName}RegisterDTO, @Req() req: ReqUidDTO) {
		const { dataLog, uid } = req.user;
		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.controller.create}\`);

		return this.create${capitalizedName}UseCase.execute({ data, dataLog, uidUser: uid });
	}

	@ApiResponse({
		status: 200,
		description: '${capitalizedName} encontrado',
		type: ${capitalizedName},
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: '${capitalizedName} no encontrado' })
	@ValidPermission(Permission.${moduleName}ReadOne)
	@Get('/one/:uid')
	async findOne(@Param() data: UidDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.controller.findOne}\`);

		return this.findOne${capitalizedName}UseCase.execute({ uid: data.uid }, dataLog);
	}

	@ApiResponse({
		status: 200,
		description: '${capitalizedName}s encontrados',
		type: [${capitalizedName}],
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ValidPermission(Permission.${moduleName}Read)
	@Get()
	async findAllPagination(
		@Query() filter: ${capitalizedName}GetAllDTO,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog } = req.user;
		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.controller.findAll}\`);

		return this.findAll${capitalizedName}sPaginationUseCase.execute({ filter, dataLog });
	}

	@ApiResponse({
		status: 200,
		description: '${capitalizedName}s encontrados',
		type: [${capitalizedName}],
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@Get('/all')
	async findAll(@Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.controller.findAll}\`);

		return this.findAll${capitalizedName}sUseCase.execute({ dataLog });
	}

	@ApiResponse({
		status: 200,
		description: '${capitalizedName} actualizado correctamente',
		type: ${capitalizedName},
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: '${capitalizedName} no encontrado' })
	@ValidPermission(Permission.${moduleName}Update)
	@Patch()
	async update(@Body() data: ${capitalizedName}UpdateDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.controller.update}\`);

		return this.update${capitalizedName}UseCase.execute({ data, dataLog });
	}

	@ApiResponse({
		status: 200,
		description: '${capitalizedName} eliminado correctamente',
	})
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiResponse({ status: 404, description: '${capitalizedName} no encontrado' })
	@ValidPermission(Permission.${moduleName}Delete)
	@Delete('/delete/:uid')
	async delete(@Param() data: UidDTO, @Req() req: ReqUidDTO) {
		const { dataLog } = req.user;
		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.controller.remove}\`);

		return this.remove${capitalizedName}UseCase.execute({ uid: data.uid, dataLog });
	}
}
`,

	// Módulo - basado en rol.module.ts
	module: (moduleName, capitalizedName) => `
import { UserModule } from '@/modules/security/user/user.module';
import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoggerService } from '@/services/logger.service';
import { ${capitalizedName} } from './entities/${moduleName}.entity';
import { ${capitalizedName}Repository } from './repository/${moduleName}.repository';
import { ${capitalizedName}Controller } from './${moduleName}.controller';
import { Create${capitalizedName}UseCase } from './use-case/create${capitalizedName}.use-case';
import { FindAll${capitalizedName}sPaginationUseCase } from './use-case/findAll${capitalizedName}sPagination.use-case';
import { FindAll${capitalizedName}sUseCase } from './use-case/findAll${capitalizedName}s.use-case';
import { FindOne${capitalizedName}UseCase } from './use-case/findOne${capitalizedName}.use-case';
import { Remove${capitalizedName}UseCase } from './use-case/remove${capitalizedName}.use-case';
import { Update${capitalizedName}UseCase } from './use-case/update${capitalizedName}.use-case';
import { RolModule } from '../security/rol/rol.module';

@Module({
	imports: [
		SequelizeModule.forFeature([${capitalizedName}]),
		forwardRef(() => UserModule),
		RolModule,
	],
	controllers: [${capitalizedName}Controller],
	providers: [
		LoggerService,
		${capitalizedName}Repository,
		Create${capitalizedName}UseCase,
		FindOne${capitalizedName}UseCase,
		FindAll${capitalizedName}sPaginationUseCase,
		FindAll${capitalizedName}sUseCase,
		Update${capitalizedName}UseCase,
		Remove${capitalizedName}UseCase,
	],
	exports: [FindOne${capitalizedName}UseCase, FindAll${capitalizedName}sUseCase, LoggerService],
})
export class ${capitalizedName}Module {}
`,

	// DTOs - basados en rol
	dto: {
		getAll: (moduleName, capitalizedName) =>
			`import { queryDTO } from '@/dto/query.dto';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Order${capitalizedName}Property } from '../enum/orderProperty';
import { ${moduleName}Messages } from '../${moduleName}.messages';

export class ${capitalizedName}GetAllDTO extends PartialType(queryDTO) {
	@ApiProperty({
		example: Order${capitalizedName}Property.name,
		enum: Order${capitalizedName}Property,
		description: 'Propiedad por la que se ordenará',
	})
	@IsOptional()
	@IsEnum(Order${capitalizedName}Property, {
		message: ${moduleName}Messages.validation.dto.enumValue,
	})
	declare readonly orderProperty?: Order${capitalizedName}Property;
}
`,

		register: (moduleName, capitalizedName) =>
			`import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString, Length } from 'class-validator';
import { ${moduleName}Messages } from '../${moduleName}.messages';

export class ${capitalizedName}RegisterDTO {
	@ApiProperty({ example: 'Nombre', description: 'Nombre del ${moduleName}' })
	@IsString({ message: ${moduleName}Messages.validation.dto.stringValue })
	@IsNotEmpty({ message: ${moduleName}Messages.validation.dto.empty })
	@Length(3, 255, { message: ${moduleName}Messages.validation.dto.lengthValue })
	@IsDefined({ message: ${moduleName}Messages.validation.dto.defined })
	declare readonly name: string;
}
`,

		update: (moduleName, capitalizedName) =>
			`import { OmitType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDefined, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ${moduleName}Messages } from '../${moduleName}.messages';
import { ${capitalizedName}RegisterDTO } from './${moduleName}Register.dto';

export class ${capitalizedName}UpdateDTO extends OmitType(${capitalizedName}RegisterDTO, []) {
	@ApiProperty({
		example: crypto.randomUUID(),
		description: 'Identificador único del ${moduleName}',
	})
	@IsUUID('all', { message: ${moduleName}Messages.validation.dto.uid.valid })
	@IsNotEmpty({ message: ${moduleName}Messages.validation.dto.empty })
	@IsDefined({ message: ${moduleName}Messages.validation.dto.defined })
	declare readonly uid: string;

	@ApiProperty({ example: true, description: 'Estado del ${moduleName}' })
	@IsBoolean({ message: ${moduleName}Messages.validation.dto.status })
	@IsNotEmpty({ message: ${moduleName}Messages.validation.dto.empty })
	@IsOptional()
	declare readonly status: boolean;
}
`,
	},

	// Entidad - basado en system.entity.ts con relación a User
	entity: (moduleName, capitalizedName) => `
import { User } from '@/modules/security/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
	BelongsTo,
	Column,
	DataType,
	ForeignKey,
	Model,
	Table,
} from 'sequelize-typescript';

@Table({
	tableName: '${capitalizedName}s',
	indexes: [
		{ unique: true, fields: ['name'], name: 'idx_${moduleName}_name' },
		{ fields: ['uidUser'], name: 'idx_${moduleName}_uid_user' },
		{ fields: ['status'], name: 'idx_${moduleName}_status' },
		{ fields: ['status', 'uidUser'], name: 'idx_${moduleName}_status_user' },
	],
})
export class ${capitalizedName} extends Model<${capitalizedName}> {
	@ApiProperty({
		example: crypto.randomUUID(),
		description: 'Identificador único del ${moduleName}',
	})
	@Column({
		primaryKey: true,
		unique: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	declare uid: string;

	@ApiProperty({ example: 'Nombre', description: 'Nombre del ${moduleName}' })
	@Column({ allowNull: false, type: DataType.STRING })
	declare name: string;

	@ApiProperty({
		example: crypto.randomUUID(),
		description: 'UID del usuario que registró el ${moduleName}',
	})
	@ForeignKey(() => User)
	@Column({ allowNull: false, type: DataType.UUID })
	declare uidUser: string;

	@ApiProperty({ example: true, description: 'Estado del ${moduleName}' })
	@Column({ defaultValue: true, allowNull: false, type: DataType.BOOLEAN })
	declare status: boolean;

	@BelongsTo(() => User)
	declare user: User;
}
`,

	// Enums - basado en rol
	enums: {
		orderProperty: (moduleName, capitalizedName) =>
			`export enum Order${capitalizedName}Property {
	name = 'name',
	status = 'status',
}`,
	},

	// Repositorio - basado en rol.repository.ts
	repository: (
		moduleName,
		capitalizedName,
	) => `import { handleDatabaseError } from '@/functions/handleDatabaseError';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
	FindAndCountOptions,
	FindAttributeOptions,
	Includeable,
	WhereOptions,
} from 'sequelize';
import { ${capitalizedName} } from '../entities/${moduleName}.entity';

@Injectable()
export class ${capitalizedName}Repository {
	private readonly logger = new Logger(${capitalizedName}Repository.name);

	constructor(
		@InjectModel(${capitalizedName}) private readonly ${moduleName}Model: typeof ${capitalizedName},
	) {}

	async create(data: Partial<${capitalizedName}>): Promise<${capitalizedName}> {
		try {
			const result = await this.${moduleName}Model.create(data as any);
			return result;
		} catch (error) {
			handleDatabaseError(
				error as Error,
				this.logger,
				'la creación del ${moduleName}',
			);
			throw error;
		}
	}

	async findOne({
		where,
		attributes,
		include,
	}: {
		where: WhereOptions<${capitalizedName}>;
		attributes?: FindAttributeOptions;
		include?: Includeable[];
	}): Promise<${capitalizedName} | null> {
		return this.${moduleName}Model.findOne({
			where,
			...(attributes && { attributes }),
			...(include && { include }),
		});
	}

	async findAndCountAll(
		options: FindAndCountOptions<${capitalizedName}>,
	): Promise<{ rows: ${capitalizedName}[]; count: number }> {
		return this.${moduleName}Model.findAndCountAll(options);
	}

	async findAll({
		where,
		attributes,
	}: {
		where: WhereOptions<${capitalizedName}>;
		attributes?: FindAttributeOptions;
	}): Promise<${capitalizedName}[]> {
		return this.${moduleName}Model.findAll({
			where,
			...(attributes && { attributes }),
		});
	}

	async update(uid: string, data: Partial<${capitalizedName}>): Promise<void> {
		try {
			await this.${moduleName}Model.update(data, { where: { uid } });
		} catch (error) {
			handleDatabaseError(
				error as Error,
				this.logger,
				'la actualización del ${moduleName}',
			);
		}
	}

	async remove(uid: string): Promise<void> {
		try {
			await this.${moduleName}Model.destroy( { where: { uid } });
		} catch (error) {
			handleDatabaseError(
				error as Error,
				this.logger,
				'la eliminación del ${moduleName}',
			);
		}
	}
}
`,

	// Use Cases - basados en rol
	useCases: {
		create: (
			moduleName,
			capitalizedName,
		) => `import { validatePropertyData } from '@/functions/validationFunction/validatePropertyData';
import { Injectable, Logger } from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { ${capitalizedName}RegisterDTO } from '../dto/${moduleName}Register.dto';
import { ${capitalizedName} } from '../entities/${moduleName}.entity';
import { ${moduleName}Messages } from '../${moduleName}.messages';
import { ${capitalizedName}Repository } from '../repository/${moduleName}.repository';

@Injectable()
export class Create${capitalizedName}UseCase {
	private readonly logger = new Logger(Create${capitalizedName}UseCase.name);

	constructor(
		private readonly ${moduleName}Repository: ${capitalizedName}Repository,
	) {}

	async execute({ data, dataLog, uidUser }: { data: ${capitalizedName}RegisterDTO; dataLog: string; uidUser: string }) {
		const { name } = data;
		const whereClause: WhereOptions<${capitalizedName}> = { name };
		const existing = await this.${moduleName}Repository.findOne({ where: whereClause });

		validatePropertyData({
			property: { name } as { name: string; status: boolean },
			data: (existing as unknown as Record<string, unknown>) ?? undefined,
			msg: ${moduleName}Messages,
		});

		await this.${moduleName}Repository.create({ ...data, uidUser });

		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.createSuccess}\`);

		return { msg: ${moduleName}Messages.register };
	}
}
`,

		findAll: (
			moduleName,
			capitalizedName,
		) => `import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/services/logger.service';
import { ${moduleName}Messages } from '../${moduleName}.messages';
import { ${capitalizedName}Repository } from '../repository/${moduleName}.repository';

@Injectable()
export class FindAll${capitalizedName}sUseCase {
	constructor(
		private readonly ${moduleName}Repository: ${capitalizedName}Repository,
		private readonly logger: LoggerService,
	) {}

	async execute({ dataLog }: { dataLog: string }) {
		const data = await this.${moduleName}Repository.findAll({
			where: { status: true },
			attributes: ['uid', 'name'],
		});

		const formatterData = data.map(item => ({
			value: item.uid,
			label: item.name,
		}));

		this.logger.info(\`\${dataLog} - \${${moduleName}Messages.log.findAllSuccess}\`, {
			type: '${moduleName}_find_all',
			count: formatterData.length,
			fromCache: false,
		});

		this.logger.logMetric('${moduleName}.buscar_todos', formatterData.length);

		return formatterData;
	}
}
`,

		findAllPagination: (
			moduleName,
			capitalizedName,
		) => `import { Order } from '@/constants/dataConstants';
import { booleanStatus } from '@/functions/booleanStatus';
import { LoggerService } from '@/services/logger.service';
import { PaginationResult } from '@/types';
import { Injectable } from '@nestjs/common';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { ${capitalizedName}GetAllDTO } from '../dto/${moduleName}GetAll.dto';
import { ${capitalizedName} } from '../entities/${moduleName}.entity';
import { Order${capitalizedName}Property } from '../enum/orderProperty';
import { ${moduleName}Messages } from '../${moduleName}.messages';
import { ${capitalizedName}Repository } from '../repository/${moduleName}.repository';

@Injectable()
export class FindAll${capitalizedName}sPaginationUseCase {
	constructor(
		private readonly ${moduleName}Repository: ${capitalizedName}Repository,
		private readonly logger: LoggerService,
	) {}

	async execute({
		filter,
		dataLog,
	}: {
		filter: ${capitalizedName}GetAllDTO;
		dataLog: string;
	}): Promise<PaginationResult<${capitalizedName}>> {
		const {
			limit = 30,
			page = 1,
			search,
			status: olStatus,
			orderProperty = Order${capitalizedName}Property.name,
			order = Order.ASC,
		} = filter;

		const status = olStatus === undefined ? undefined : (booleanStatus({ status: olStatus }) ?? true);
		const parsedLimit = Math.min(Number(limit), 100);
		const parsedPage = Math.max(Number(page), 1);

		const where = this.buildWhereClause(status, search);
		const queryOptions = this.buildQueryOptions(
			where,
			orderProperty,
			order,
			parsedLimit,
			parsedPage,
		);

		const { rows, count } =
			await this.${moduleName}Repository.findAndCountAll(queryOptions);

		const result = {
			rows,
			count,
			...this.calculatePagination(count, parsedLimit, parsedPage),
		};

		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.findAllSuccess}\`);

		return result;
	}

	private buildWhereClause(
		status: boolean | undefined,
		search?: string,
	): WhereOptions<${capitalizedName}> {
		const where: WhereOptions<${capitalizedName}> = {};

		if (status !== undefined) {
			where.status = status;
		}

		if (search) {
			where.name = { [Op.iLike]: \`%\${search}%\` };
		}

		return where;
	}

	private buildQueryOptions(
		where: WhereOptions<${capitalizedName}>,
		orderProperty: Order${capitalizedName}Property,
		order: Order,
		limit: number,
		page: number,
	): FindAndCountOptions<${capitalizedName}> {
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
`,

		findOne: (
			moduleName,
			capitalizedName,
		) => `import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { LoggerService } from '@/services/logger.service';
import { Injectable } from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { ${capitalizedName} } from '../entities/${moduleName}.entity';
import { ${moduleName}Messages } from '../${moduleName}.messages';
import { ${capitalizedName}Repository } from '../repository/${moduleName}.repository';

@Injectable()
export class FindOne${capitalizedName}UseCase {
	constructor(
		private readonly ${moduleName}Repository: ${capitalizedName}Repository,
		private readonly logger: LoggerService,
	) {}

	async execute(where: WhereOptions<${capitalizedName}>, dataLog?: string) {
		const data = await this.${moduleName}Repository.findOne({
			where: { ...where },
			attributes: {
				exclude: ['createdAt', 'updatedAt'],
			},
		});

		if (!data) {
			this.logger.error(
				\`\${dataLog ? dataLog : 'system'} - \${${moduleName}Messages.log.findOne}\`,
				'FindOne${capitalizedName}UseCase',
				{ type: '${moduleName}_find_one', status: 'not_found' },
			);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: ${moduleName}Messages.findOne }),
			);
		}

		this.logger.info(
			\`\${dataLog ? dataLog : 'system'} - \${${moduleName}Messages.log.findOneSuccess}\`,
			{ type: '${moduleName}_find_one', id: data.uid, fromCache: false },
		);

		return data;
	}
}
`,

		remove: (
			moduleName,
			capitalizedName,
		) => `import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { Injectable, Logger } from '@nestjs/common';
import { ${moduleName}Messages } from '../${moduleName}.messages';
import { ${capitalizedName}Repository } from '../repository/${moduleName}.repository';

@Injectable()
export class Remove${capitalizedName}UseCase {
	private readonly logger = new Logger(Remove${capitalizedName}UseCase.name);

	constructor(
		private readonly ${moduleName}Repository: ${capitalizedName}Repository,
	) {}

	async execute({ uid, dataLog }: { uid: string; dataLog: string }) {
		const data = await this.${moduleName}Repository.findOne({ where: { uid, status: true } });
	
		if (!data) {
			this.logger.error(\`\${dataLog} - \${${moduleName}Messages.log.${moduleName}Error}\`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: ${moduleName}Messages.findOne }),
			);
		}

		await this.${moduleName}Repository.remove(uid);

		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.removeSuccess}\`);

		return { msg: ${moduleName}Messages.delete };
	}
}
`,

		update: (
			moduleName,
			capitalizedName,
		) => `import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { Injectable, Logger } from '@nestjs/common';
import { ${capitalizedName}UpdateDTO } from '../dto/${moduleName}Update.dto';
import { ${moduleName}Messages } from '../${moduleName}.messages';
import { ${capitalizedName}Repository } from '../repository/${moduleName}.repository';

@Injectable()
export class Update${capitalizedName}UseCase {
	private readonly logger = new Logger(Update${capitalizedName}UseCase.name);

	constructor(
		private readonly ${moduleName}Repository: ${capitalizedName}Repository,
	) {}

	async execute({ data, dataLog }: { data: ${capitalizedName}UpdateDTO; dataLog: string }) {
		const existing = await this.${moduleName}Repository.findOne({ where: { uid: data.uid } });
		if (!existing) {
			this.logger.error(\`\${dataLog} - \${${moduleName}Messages.log.${moduleName}Error}\`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: ${moduleName}Messages.findOne }),
			);
		}

		await this.${moduleName}Repository.update(data.uid, { ...data });

		this.logger.log(\`\${dataLog} - \${${moduleName}Messages.log.updateSuccess}\`);

		return { msg: ${moduleName}Messages.update };
	}
}
`,
	},

	// Types definition file
	types: moduleName => `// Types for ${moduleName} module
`,
};
