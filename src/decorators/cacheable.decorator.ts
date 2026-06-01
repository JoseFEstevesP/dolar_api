import { SetMetadata } from '@nestjs/common';

export const CACHE_TTL_METADATA = 'cache:ttl';
export const CACHE_PREFIX_METADATA = 'cache:prefix';

export interface CacheableOptions {
	ttl?: number;
	prefix?: string;
}

export const Cacheable = (options: CacheableOptions = {}) =>
	SetMetadata(CACHE_TTL_METADATA, options.ttl ?? 300000);

export const CacheableShort = () => SetMetadata(CACHE_TTL_METADATA, 60000);

export const CacheableMedium = () => SetMetadata(CACHE_TTL_METADATA, 300000);

export const CacheableLong = () => SetMetadata(CACHE_TTL_METADATA, 3600000);

export const CachePrefix = (prefix: string) =>
	SetMetadata(CACHE_PREFIX_METADATA, prefix);
