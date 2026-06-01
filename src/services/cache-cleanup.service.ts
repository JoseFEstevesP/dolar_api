import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheService } from './cache.service';

@Injectable()
export class CacheCleanupService implements OnModuleInit {
	private readonly logger = new Logger(CacheCleanupService.name);

	constructor(private readonly cacheService: CacheService) {}

	onModuleInit() {
		this.logger.log('CacheCleanupService initialized');
	}

	@Cron(CronExpression.EVERY_HOUR)
	async handleHourlyCacheCleanup() {
		this.logger.log('Running hourly cache cleanup');
		try {
			await this.cacheService.reset();
			this.logger.log('Hourly cache cleanup completed');
		} catch (error) {
			this.logger.error('Error during cache cleanup:', error);
		}
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async handleDailyCacheCleanup() {
		this.logger.log('Running daily cache cleanup');
		try {
			await this.cacheService.delPattern('cache:user');
			await this.cacheService.delPattern('cache:health');
			this.logger.log('Daily cache cleanup completed');
		} catch (error) {
			this.logger.error('Error during daily cache cleanup:', error);
		}
	}
}
