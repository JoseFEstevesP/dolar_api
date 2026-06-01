import {
	Environment,
	EnvironmentVariables,
	CONFIG_DOCS,
} from '@/config/env.config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AppConfig {
	port: number;
	env: Environment;
	isProduction: boolean;
	isDevelopment: boolean;
	isTest: boolean;
	jwtConfig: {
		secret: string;
		refreshSecret: string;
		expiresIn: string;
		refreshExpiresIn: string;
	};
	emailConfig: {
		host: string;
		user: string;
		pass: string;
	};
	databaseConfig: {
		dialect: string;
		host: string;
		port: number;
		username: string;
		password: string;
		database: string;
	};
	corsConfig: string[];
	rateLimitConfig: {
		ttl: number;
		limit: number;
		tiers: {
			short: { ttl: number; limit: number };
			medium: { ttl: number; limit: number };
			long: { ttl: number; limit: number };
			auth: { ttl: number; limit: number };
		};
	};
	redisConfig: {
		url: string;
		max: number;
		ttl: number;
	};
	securityConfig: {
		saltRounds: number;
		bcryptRounds: number;
	};
	frontEndUrl: string;
	cacheConfig: {
		enabled: boolean;
		ttl: number;
		max: number;
	};
}

@Injectable()
export class AppConfigService {
	constructor(private configService: ConfigService<EnvironmentVariables>) {}

	get config(): AppConfig {
		const env = this.environment;

		return {
			port: this.port,
			env,
			isProduction: env === Environment.Production,
			isDevelopment: env === Environment.Development,
			isTest: env === Environment.Test,
			jwtConfig: this.jwtConfig,
			emailConfig: this.emailConfig,
			databaseConfig: this.databaseConfig,
			corsConfig: this.corsConfig,
			rateLimitConfig: this.rateLimitConfig,
			redisConfig: this.redisConfig,
			securityConfig: this.securityConfig,
			frontEndUrl: this.frontEndUrl,
			cacheConfig: this.cacheConfig,
		};
	}

	get environment(): Environment {
		const env =
			this.configService.get<string>('NODE_ENV', { infer: true }) ??
			'development';
		return env as Environment;
	}

	get port(): number {
		return this.configService.get<number>('PORT', { infer: true }) ?? 3000;
	}

	get jwtConfig() {
		const isProduction = this.environment === Environment.Production;
		return {
			secret:
				this.configService.get<string>('JWT_SECRET', { infer: true }) ?? '',
			refreshSecret:
				this.configService.get<string>('JWT_REFRESH_SECRET', { infer: true }) ??
				'',
			expiresIn: isProduction ? '15m' : '1h',
			refreshExpiresIn: isProduction ? '7d' : '30d',
		};
	}

	get emailConfig() {
		return {
			host: this.configService.get<string>('EMAIL_HOST', { infer: true }) ?? '',
			user: this.configService.get<string>('EMAIL_USER', { infer: true }) ?? '',
			pass: this.configService.get<string>('EMAIL_PASS', { infer: true }) ?? '',
		};
	}

	get databaseConfig() {
		const isDev = this.environment === Environment.Development;
		return {
			dialect:
				this.configService.get<string>('DATABASE_DIALECT', { infer: true }) ??
				'postgres',
			host: isDev
				? 'db'
				: (this.configService.get<string>('DATABASE_HOST', { infer: true }) ??
					'localhost'),
			port:
				this.configService.get<number>('DATABASE_PORT', { infer: true }) ??
				5432,
			username:
				this.configService.get<string>('POSTGRES_USER', { infer: true }) ?? '',
			password:
				this.configService.get<string>('POSTGRES_PASSWORD', { infer: true }) ??
				'',
			database:
				this.configService.get<string>('POSTGRES_DB', { infer: true }) ?? '',
		};
	}

	get corsConfig(): string[] {
		const cors = this.configService.get('CORS');
		if (Array.isArray(cors)) {
			return cors as string[];
		}
		return [];
	}

	get rateLimitConfig() {
		const ttl =
			this.configService.get<number>('RATE_LIMIT_TTL', { infer: true }) ??
			60000;
		const limit =
			this.configService.get<number>('RATE_LIMIT_LIMIT', { infer: true }) ??
			100;

		return {
			ttl,
			limit,
			tiers: {
				short: { ttl: ttl, limit },
				medium: { ttl: 60000 * 5, limit: 50 },
				long: { ttl: 60000 * 10, limit: 20 },
				auth: { ttl: 60000 * 15, limit: 5 },
			},
		};
	}

	get redisConfig() {
		return {
			url: this.configService.get<string>('REDIS_URL', { infer: true }) ?? '',
			max: 1000,
			ttl: 300000,
		};
	}

	get securityConfig() {
		const isProduction = this.environment === Environment.Production;
		return {
			saltRounds:
				this.configService.get<number>('SALT_ROUNDS', { infer: true }) ?? 10,
			bcryptRounds: isProduction ? 12 : 10,
		};
	}

	get frontEndUrl(): string {
		return (
			this.configService.get<string>('FRONT_END_URL', { infer: true }) ?? ''
		);
	}

	get cacheConfig() {
		const isProduction = this.environment === Environment.Production;
		return {
			enabled: true,
			ttl: isProduction ? 180000 : 300000,
			max: isProduction ? 500 : 1000,
		};
	}

	getConfigDocs(): Record<
		string,
		{ description: string; required: boolean; envExample: string }
	> {
		return CONFIG_DOCS;
	}
}
