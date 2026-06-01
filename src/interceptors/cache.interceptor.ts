import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';

export interface CacheInterceptorOptions {
	ttl?: number;
	prefix?: string;
}

export function CacheKey(prefix?: string, ...args: (string | number)[]) {
	return `${prefix ?? 'default'}:${args.join(':')}`;
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
	private readonly logger = new Logger(CacheInterceptor.name);

	constructor(
		private readonly cacheService: CacheService,
		private readonly ttl?: number,
		private readonly prefix?: string,
	) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest();
		const { method, url, query } = request;

		if (method !== 'GET') {
			return next.handle();
		}

		const cacheKey = this.buildCacheKey(url, query);

		return of(cacheKey).pipe(
			tap(() => this.logger.debug(`Cache check: ${cacheKey}`)),
		);
	}

	private buildCacheKey(url: string, query: Record<string, unknown>): string {
		const queryString = Object.keys(query)
			.sort()
			.map(key => `${key}=${query[key]}`)
			.join('&');

		const key = queryString ? `${url}?${queryString}` : url;
		return this.cacheService.buildKey(key, this.prefix);
	}
}

@Injectable()
export class CachedInterceptor implements NestInterceptor {
	private readonly logger = new Logger(CachedInterceptor.name);
	private readonly defaultTTL = 300000;

	constructor(
		private readonly cacheService: CacheService,
		private readonly ttl: number = this.defaultTTL,
		private readonly prefix?: string,
	) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest();
		const { method, url, query } = request;

		if (method !== 'GET') {
			return next.handle();
		}

		const cacheKey = this.buildCacheKey(url, query);

		return of(cacheKey).pipe(
			tap(() => this.logger.debug(`Cache check: ${cacheKey}`)),
		);
	}

	private buildCacheKey(url: string, query: Record<string, unknown>): string {
		const queryString = Object.keys(query)
			.sort()
			.map(key => `${key}=${query[key]}`)
			.join('&');

		const key = queryString ? `${url}?${queryString}` : url;
		return this.cacheService.buildKey(key, this.prefix);
	}
}
