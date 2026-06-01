import { EnvironmentVariables } from '@/config/env.config';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@/services/jwt.service';

@Global()
@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: JwtService,
			useFactory: (configService: ConfigService<EnvironmentVariables>) =>
				new JwtService(configService),
			inject: [ConfigService],
		},
	],
	exports: [JwtService],
})
export class JwtModule {}
