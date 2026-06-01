import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

export interface CacheOptions {
	ttl?: number;
	prefix?: string;
}

export interface CacheWithFallbackOptions<T> extends CacheOptions {
	key: string;
	fallback: () => Promise<T>;
	ttl?: number;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
	private readonly logger = new Logger(CacheService.name);
	private readonly defaultTTL = 300000;
	private readonly prefixes = new Map<string, string>();

	constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
		this.initPrefixes();
	}

	private initPrefixes() {
		this.prefixes.set('role', 'cache:role');
		this.prefixes.set('permission', 'cache:permission');
		this.prefixes.set('config', 'cache:config');
		this.prefixes.set('user', 'cache:user');
		this.prefixes.set('health', 'cache:health');
		this.prefixes.set('payments', 'cache:payments');
		this.prefixes.set('paymentMethod', 'cache:paymentMethod');
		this.prefixes.set('language', 'cache:language');
		this.prefixes.set('company', 'cache:company');
		this.prefixes.set('companySyste', 'cache:companySyste');
	}

	async get<T>(key: string): Promise<T | undefined> {
		try {
			const value = await this.cacheManager.get<T>(key);
			if (value !== undefined) {
				this.logger.debug(`Cache HIT: ${key}`);
			}
			return value;
		} catch (error) {
			this.logger.error(`Cache GET error for key ${key}:`, error);
			return undefined;
		}
	}

	async set<T>(key: string, value: T, ttl?: number): Promise<void> {
		try {
			const effectiveTTL = ttl ?? this.defaultTTL;
			await this.cacheManager.set(key, value, effectiveTTL);
			this.logger.debug(`Cache SET: ${key} (TTL: ${effectiveTTL}ms)`);
		} catch (error) {
			this.logger.error(`Cache SET error for key ${key}:`, error);
		}
	}

	async del(key: string): Promise<void> {
		try {
			await this.cacheManager.del(key);
			this.logger.debug(`Cache DEL: ${key}`);
		} catch (error) {
			this.logger.error(`Cache DEL error for key ${key}:`, error);
		}
	}

	private extractRedisClient(
		store: Record<string, unknown>,
	): { scan: Function } | undefined {
		// Direct KeyvRedis: store.client
		const client = store.client as { scan: Function } | undefined;
		if (client?.scan) return client;

		// Keyv wrapping: store.opts.store.client
		const optsStore = (
			store.opts as Record<string, unknown> | undefined
		)?.store as Record<string, unknown> | undefined;
		if (optsStore) {
			const nestedClient = optsStore.client as
				| { scan: Function }
				| undefined;
			if (nestedClient?.scan) return nestedClient;
		}

		return undefined;
	}

	async delPattern(pattern: string): Promise<void> {
		try {
			const cm = this.cacheManager as Record<string, unknown>;

			// Try cache-manager v7 stores[] first
			const stores = cm.stores as Record<string, unknown>[] | undefined;
			if (stores && stores.length > 0) {
				for (const store of stores) {
					const client = this.extractRedisClient(store);
					if (client) {
						await this.scanAndDelete(client, pattern);
						return;
					}
				}
			}

			// Fallback: cache-manager v5 .store (single)
			const store = cm.store as Record<string, unknown> | undefined;
			if (store) {
				const client = this.extractRedisClient(store);
				if (client) {
					await this.scanAndDelete(client, pattern);
					return;
				}

				// In-memory fallback
				const keysFn = store.keys as
					| ((pattern?: string) => string[])
					| undefined;
				if (typeof keysFn === 'function') {
					const keys = keysFn(`*${pattern}*`);
					await Promise.all(
						keys.map((key: string) => this.cacheManager.del(key)),
					);
					this.logger.debug(
						`Cache DEL pattern: ${pattern} (in-memory, ${keys.length} keys)`,
					);
					return;
				}
			}

			this.logger.warn(`Cache DEL pattern not supported: ${pattern}`);
		} catch (error) {
			this.logger.warn(`Cache DEL pattern error: ${pattern}`, error);
		}
	}

	private async scanAndDelete(
		client: { scan: Function },
		pattern: string,
	): Promise<void> {
		const scanPattern = `*${pattern}*`;
		let cursor = 0;
		let deleted = 0;
		do {
			const result = await client.scan(cursor, {
				MATCH: scanPattern,
				COUNT: 100,
			});
			cursor = Number(result.cursor);
			const keys: string[] = result.keys;
			if (keys.length > 0) {
				await Promise.all(
					keys.map((key: string) => this.cacheManager.del(key)),
				);
				deleted += keys.length;
			}
		} while (cursor !== 0);
		this.logger.debug(
			`Cache DEL pattern: ${pattern} (Redis SCAN, ${deleted} keys)`,
		);
	}

	async getOrSet<T>(options: CacheWithFallbackOptions<T>): Promise<T> {
		const { key, fallback, ttl, prefix } = options;
		const cacheKey = this.buildKey(key, prefix);

		const cached = await this.get<T>(cacheKey);
		if (cached !== undefined) {
			return cached;
		}

		this.logger.debug(`Cache MISS: ${cacheKey}, fetching from fallback`);
		const result = await fallback();
		await this.set(cacheKey, result, ttl);
		return result;
	}

	async getWithFallback<T>(
		key: string,
		fallback: () => Promise<T>,
		ttl?: number,
	): Promise<T> {
		const cached = await this.get<T>(key);
		if (cached !== undefined) {
			return cached;
		}

		try {
			const result = await fallback();
			await this.set(key, result, ttl);
			return result;
		} catch (error) {
			this.logger.warn(
				`Fallback failed for ${key}, returning stale data if available`,
			);
			const stale = await this.get<T>(key);
			if (stale !== undefined) {
				return stale;
			}
			throw error;
		}
	}

	buildKey(key: string, prefix?: string): string {
		if (prefix && this.prefixes.has(prefix)) {
			return `${this.prefixes.get(prefix)}:${key}`;
		}
		return `cache:${key}`;
	}

	buildUserKey(uid: string): string {
		return this.buildKey(uid, 'user');
	}

	buildRoleKey(uid: string): string {
		return this.buildKey(uid, 'role');
	}

	buildRoleListKey(): string {
		return this.buildKey('all', 'role');
	}

async reset(): Promise<void> {
		await this.delPattern('cache:');
		this.logger.log('Cache reset complete');
	}

	async onModuleDestroy(): Promise<void> {
		this.logger.log('CacheService destroyed');
	}
}
