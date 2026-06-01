import { HealthCheckService, HealthCheckResult } from '@nestjs/terminus';
import { RedisHealthIndicator, SystemHealthIndicator, HealthController } from './health.controller';

describe('RedisHealthIndicator', () => {
	const mockCacheManager = {
		set: vi.fn(),
		get: vi.fn(),
	};

	let redisHealthIndicator: RedisHealthIndicator;

	beforeEach(() => {
		vi.clearAllMocks();
		redisHealthIndicator = new RedisHealthIndicator(mockCacheManager as any);
	});

	it('should return healthy status when redis responds correctly', async () => {
		mockCacheManager.set.mockResolvedValue(undefined);
		mockCacheManager.get.mockResolvedValue('ok');

		const result = await redisHealthIndicator.ping('health-check-redis');

		expect(result.redis.status).toBe('up');
		expect(result.redis.responseTime).toBeDefined();
		expect(typeof result.redis.responseTime).toBe('number');
	});

	it('should throw an error when value mismatches', async () => {
		mockCacheManager.set.mockResolvedValue(undefined);
		mockCacheManager.get.mockResolvedValue('wrong-value');

		await expect(redisHealthIndicator.ping('health-check-redis')).rejects.toThrow(
			'Redis check failed: Value mismatch',
		);
	});

	it('should throw an error when cache manager throws', async () => {
		mockCacheManager.set.mockRejectedValue(new Error('Connection refused'));

		await expect(redisHealthIndicator.ping('health-check-redis')).rejects.toThrow(
			'Redis check failed: Connection refused',
		);
	});
});

describe('SystemHealthIndicator', () => {
	let systemHealthIndicator: SystemHealthIndicator;

	beforeEach(() => {
		systemHealthIndicator = new SystemHealthIndicator();
	});

	it('should return system health status', () => {
		const result = systemHealthIndicator.check();

		expect(result.system.status).toBeDefined();
		expect(result.system.cpu).toBeDefined();
		expect(typeof result.system.cpu).toBe('number');
		expect(result.system.memory).toBeDefined();
		expect(typeof result.system.memory).toBe('number');
	});
});

describe('HealthController', () => {
	const mockHealthCheckService = {
		check: vi.fn(),
	};
	const mockDb = {} as any;
	const mockMemory = {} as any;
	const mockRedisHealth = { ping: vi.fn() };
	const mockSystemHealth = { check: vi.fn() };

	let healthController: HealthController;

	beforeEach(() => {
		vi.clearAllMocks();
		healthController = new HealthController(
			mockHealthCheckService as any,
			mockDb,
			mockMemory,
			mockRedisHealth as any,
			mockSystemHealth as any,
		);
	});

	it('should return health check result', async () => {
		const expectedResult: HealthCheckResult = {
			status: 'ok',
			info: {
				database: { status: 'up' },
				redis: { status: 'up', responseTime: 5 },
				heap_used: { status: 'up' },
				system: { status: 'up', cpu: 0.25, memory: 45.5 },
			},
			error: {},
			details: {
				database: { status: 'up' },
				redis: { status: 'up', responseTime: 5 },
				heap_used: { status: 'up' },
				system: { status: 'up', cpu: 0.25, memory: 45.5 },
			},
		};

		mockHealthCheckService.check.mockResolvedValue(expectedResult);

		const result = await healthController.check();

		expect(result).toEqual(expectedResult);
		expect(mockHealthCheckService.check).toHaveBeenCalled();
	});
});
