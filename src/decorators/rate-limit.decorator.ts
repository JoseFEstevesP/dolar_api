import { SkipThrottle, Throttle } from '@nestjs/throttler';

export { SkipThrottle };

export const ThrottleShort = () =>
	Throttle({ default: { ttl: 60000, limit: 100 } });

export const ThrottleMedium = () =>
	Throttle({
		default: { ttl: 60000 * 5, limit: 50 },
	});

export const ThrottleLong = () =>
	Throttle({
		default: { ttl: 60000 * 10, limit: 20 },
	});

export const ThrottleAuth = () =>
	Throttle({
		default: { ttl: 60000 * 15, limit: 5 },
	});

export const ThrottleStrict = () =>
	Throttle({
		default: { ttl: 60000 * 60, limit: 3 },
	});
