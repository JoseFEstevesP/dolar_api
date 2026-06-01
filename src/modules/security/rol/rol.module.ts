import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from '@/shared/database/database.module';
import { Module } from '@nestjs/common';
import { CacheService } from '@/services/cache.service';
import { RolController } from './rol.controller';
import { CreateRolUseCase } from './use-case/createRol.use-case';
import { FindAllRolsPaginationUseCase } from './use-case/findAllRolsPagination.use-case';
import { FindAllRolsUseCase } from './use-case/findAllRols.use-case';
import { FindOneRolUseCase } from './use-case/findOneRol.use-case';
import { FindRolPermissionsUseCase } from './use-case/findRolPermissions.use-case';
import { RemoveRolUseCase } from './use-case/removeRol.use-case';
import { UpdateRolUseCase } from './use-case/updateRol.use-case';

@Module({
imports: [
	CacheModule.register(),
	DatabaseModule,
],
	controllers: [RolController],
	providers: [
		CacheService,
		CreateRolUseCase,
		FindOneRolUseCase,
		FindAllRolsPaginationUseCase,
		FindAllRolsUseCase,
		UpdateRolUseCase,
		RemoveRolUseCase,
		FindRolPermissionsUseCase,
	],
	exports: [FindOneRolUseCase, FindAllRolsUseCase, CacheService],
})
export class RolModule {}
