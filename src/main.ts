import {
	BadRequestException,
	INestApplication,
	ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { EnvironmentVariables } from './config/env.config';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { objectError } from './functions/objectError';
import { globalMsg } from './globalMsg';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggerService } from './services/logger.service';

function setupSwagger(app: INestApplication) {
	const config = new DocumentBuilder()
		.setTitle(globalMsg.swagger.title)
		.setDescription(globalMsg.swagger.description)
		.setVersion(globalMsg.swagger.version)
		.addTag(
			globalMsg.swagger.tags.health.name,
			globalMsg.swagger.tags.health.description,
		)
		.addTag(
			globalMsg.swagger.tags.exchangeRate.name,
			globalMsg.swagger.tags.exchangeRate.description,
		)
		.build();

	const document = SwaggerModule.createDocument(app, config, {
		ignoreGlobalPrefix: false,
		deepScanRoutes: false,
		extraModels: [],
	});

	if (process.argv.includes('--generate-docs')) {
		const fs = require('fs');
		const path = require('path');

		const docsDir = path.join(process.cwd(), 'docs', 'swagger');
		if (!fs.existsSync(docsDir)) {
			fs.mkdirSync(docsDir, { recursive: true });
		}

		fs.writeFileSync(
			path.join(docsDir, 'swagger-spec.json'),
			JSON.stringify(document, null, 2),
			'utf8',
		);

		process.exit(0);
	}

	SwaggerModule.setup('doc', app, document, {
		swaggerOptions: {
			persistAuthorization: true,
		},
	});
}

async function bootstrap() {
	const logger = new LoggerService();
	const app = await NestFactory.create(AppModule, {
		logger,
	});

	app.use(
		compression({
			threshold: 1024,
			level: 6,
			filter: (req, res) => {
				if (req.headers['x-no-compression']) {
					return false;
				}
				return compression.filter(req, res);
			},
		}),
	);
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					styleSrc: ["'self'", "'unsafe-inline'"],
					scriptSrc: ["'self'"],
					imgSrc: ["'self'", 'data:', 'https:'],
					connectSrc: ["'self'"],
					fontSrc: ["'self'"],
					objectSrc: ["'none'"],
					mediaSrc: ["'self'"],
					frameSrc: ["'none'"],
					upgradeInsecureRequests: [],
				},
			},
			hsts: {
				maxAge: 31536000,
				includeSubDomains: true,
				preload: true,
			},
			referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
			xContentTypeOptions: true,
			frameguard: {
				action: 'deny',
			},
		}),
	);

	const loggerService = new LoggerService();

	const httpAdapterHost = app.get(HttpAdapterHost);
	app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, loggerService));

	app.useGlobalInterceptors(
		new LoggingInterceptor(loggerService),
		new TransformInterceptor(),
	);

	const expressApp = app.getHttpAdapter().getInstance();
	expressApp.set('trust proxy', true);

	const configService = app.get(ConfigService<EnvironmentVariables>);

	app.enableCors({
		origin: configService.get('CORS'),
		credentials: true,
		methods: 'GET,PATCH,POST,DELETE',
	});

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
			whitelist: true,
			forbidNonWhitelisted: true,
			exceptionFactory: errors => {
				const result = errors.map(error => {
					const constraints = error.constraints;
					const firstKey = Object.keys(constraints ?? {})[0];
					return objectError({
						name: error.property,
						msg: constraints?.[firstKey] ?? '',
					});
				});

				return new BadRequestException(Object.assign({}, ...result));
			},
			stopAtFirstError: true,
		}),
	);

	app.setGlobalPrefix('api');

	setupSwagger(app);

	const port = configService.get('PORT');
	await app.listen(port, '0.0.0.0');
}

bootstrap();
