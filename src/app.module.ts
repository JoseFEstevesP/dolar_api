import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.config';
import { CorrelationIdMiddleware } from './correlation-id/correlationId.middleware';
import { ExchangeRateModule } from './modules/exchange-rate/exchange-rate.module';
import { HealthModule } from './modules/health/health.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			validate: validateEnv,
			isGlobal: true,
			envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
		}),
		ExchangeRateModule,
		HealthModule,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(CorrelationIdMiddleware).forRoutes('{*splat}');
	}
}
