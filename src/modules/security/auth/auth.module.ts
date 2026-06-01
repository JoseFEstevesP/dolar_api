import { AuditModule } from '@/modules/security/audit/audit.module';
import { UserModule } from '@/modules/security/user/user.module';
import { DatabaseModule } from '@/shared/database/database.module';
import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { LoginUseCase } from './use-case/login.use-case';
import { LogoutUseCase } from './use-case/logout.use-case';
import { RefreshTokenUseCase } from './use-case/refreshToken.use-case';
import { CheckSessionUseCase } from './use-case/checkSession.use-case';

@Module({
imports: [
	forwardRef(() => UserModule),
	forwardRef(() => AuditModule),
	DatabaseModule,
],
	controllers: [AuthController],
	providers: [
		LoginUseCase,
		LogoutUseCase,
		RefreshTokenUseCase,
		CheckSessionUseCase,
	],
})
export class AuthModule {}
