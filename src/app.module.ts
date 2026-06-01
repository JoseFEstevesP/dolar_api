import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Dialect } from 'sequelize';
import { EnvironmentVariables, validateEnv } from './config/env.config';
import { CorrelationIdMiddleware } from './correlation-id/correlationId.middleware';
import { FilesModule } from './modules/files/files.module';
import { HealthModule } from './modules/health/health.module';
import { AuditModule } from './modules/security/audit/audit.module';
import { AuthModule } from './modules/security/auth/auth.module';
import { JwtModule } from './modules/security/jwt/jwt.module';
import { RolModule } from './modules/security/rol/rol.module';
import { UserModule } from './modules/security/user/user.module';
import { DatabaseModule } from './shared/database/database.module';
import { LoggerModule } from './shared/logger/logger.module';
import { CacheCleanupService } from './services/cache-cleanup.service';
import { AppConfigService } from './services/config.service';

@Module({
	imports: [
		ConfigModule.forRoot({
			validate: validateEnv,
			isGlobal: true,
			envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
		}),
		ThrottlerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService<EnvironmentVariables>) => ({
				throttlers: [
					{
						name: 'short',
						ttl: config.get<number>('RATE_LIMIT_TTL', { infer: true }) ?? 60000,
						limit:
							config.get<number>('RATE_LIMIT_LIMIT', { infer: true }) ?? 500,
					},
					{
						name: 'medium',
						ttl: 60000 * 5,
						limit: 300,
					},
					{
						name: 'long',
						ttl: 60000 * 10,
						limit: 100,
					},
					{
						name: 'auth',
						ttl: 60000 * 15,
						limit: 20,
					},
				],
				ignoreRoutes: ['/api/auth/refresh-token', '/api/auth/check-session'],
			}),
		}),
		ScheduleModule.forRoot(),
		SequelizeModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService<EnvironmentVariables>) => {
				const isDevelopment = config.get('NODE_ENV') === 'development';

				return {
					dialect: config.get<string>('DATABASE_DIALECT') as Dialect,
					host: isDevelopment ? 'db' : config.get<string>('DATABASE_HOST'),
					port: isDevelopment ? 5432 : config.get<number>('DATABASE_PORT'),
					username: config.get<string>('POSTGRES_USER'),
					password: config.get<string>('POSTGRES_PASSWORD'),
					database: config.get<string>('POSTGRES_DB'),
					autoLoadModels: true,
					synchronize: false,
					logging: false,
				};
			},
		}),
		CacheModule.registerAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService<EnvironmentVariables>) => ({
				store: new KeyvRedis({
					url: config.get<string>('REDIS_URL'),
				}),
				max: 1000,
				ttl: 300000,
			}),
			isGlobal: true,
		}),
		LoggerModule,
		DatabaseModule,
		FilesModule,
		JwtModule,
		UserModule,
		RolModule,
		AuditModule,
		AuthModule,
		HealthModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: AppConfigService,
			useClass: AppConfigService,
		},
		CacheCleanupService,
	],
	exports: [AppConfigService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(CorrelationIdMiddleware).forRoutes('{*splat}');
	}
}
