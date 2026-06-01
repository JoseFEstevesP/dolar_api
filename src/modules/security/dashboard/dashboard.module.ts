import { AuditModule } from '@/modules/security/audit/audit.module';
import { UserModule } from '@/modules/security/user/user.module';
import { DatabaseModule } from '@/shared/database/database.module';
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { GetDashboardDataUseCase } from './use-case/getDashboardData.use-case';

@Module({
	imports: [
		UserModule,
		AuditModule,
		DatabaseModule,
	],
	controllers: [DashboardController],
	providers: [
		GetDashboardDataUseCase,
	],
})
export class DashboardModule {}
