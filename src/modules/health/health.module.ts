import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import {
	HealthController,
	RedisHealthIndicator,
	SystemHealthIndicator,
} from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
	imports: [TerminusModule, SequelizeModule, CacheModule.register()],
	controllers: [HealthController],
	providers: [RedisHealthIndicator, SystemHealthIndicator],
})
export class HealthModule {}
