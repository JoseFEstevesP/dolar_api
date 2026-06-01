import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Controller, Get, Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import {
	HealthCheck,
	HealthCheckService,
	HealthCheckResult,
	HealthIndicator,
	HealthIndicatorResult,
	MemoryHealthIndicator,
	SequelizeHealthIndicator,
} from '@nestjs/terminus';
import * as os from 'os';

export class RedisHealthIndicator extends HealthIndicator {
	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
		super();
	}

	async ping(key: string): Promise<HealthIndicatorResult> {
		const start = Date.now();
		try {
			const testValue = 'ok';
			await this.cacheManager.set(key, testValue, 1000);
			const retrievedValue = await this.cacheManager.get(key);
			const responseTime = Date.now() - start;

			if (retrievedValue === testValue) {
				return this.getStatus('redis', true, { responseTime });
			}
			throw new Error('Value mismatch');
		} catch (e) {
			const err = e as Error;
			throw new Error(`Redis check failed: ${err.message}`);
		}
	}
}

export class SystemHealthIndicator extends HealthIndicator {
	check(): HealthIndicatorResult {
		const cpuLoad = os.loadavg()[0] / os.cpus().length;
		const totalMemory = os.totalmem();
		const freeMemory = os.freemem();
		const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

		// Adjusted thresholds for development environment
		const isHealthy = cpuLoad < 2.0 && memoryUsage < 90;

		return this.getStatus('system', isHealthy, {
			cpu: Math.round(cpuLoad * 100) / 100,
			memory: Math.round(memoryUsage * 100) / 100,
		});
	}
}

@Controller('health')
export class HealthController {
	constructor(
		private health: HealthCheckService,
		private db: SequelizeHealthIndicator,
		private memory: MemoryHealthIndicator,
		private redisHealth: RedisHealthIndicator,
		private systemHealth: SystemHealthIndicator,
	) {}

	@Get()
	@HealthCheck()
	async check(): Promise<HealthCheckResult> {
		return this.health.check([
			() => this.db.pingCheck('database', { timeout: 3000 }),
			() => this.redisHealth.ping('health-check-redis'),
			() => this.memory.checkHeap('heap_used', 300 * 1024 * 1024),
			() => this.systemHealth.check(),
		]);
	}
}
