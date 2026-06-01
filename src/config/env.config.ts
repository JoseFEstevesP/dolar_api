import { plainToClass } from 'class-transformer';
import {
	IsEmail,
	IsEnum,
	IsNumber,
	IsString,
	Max,
	Min,
	MinLength,
	Validate,
	validateSync,
} from 'class-validator';
import { type Dialect } from 'sequelize';
import { IsCorsValidConstraint } from './isCorsValid';

export enum Environment {
	Development = 'development',
	Production = 'production',
	Test = 'test',
}

export const CONFIG_DOCS = {
	JWT_SECRET: {
		description: 'Clave secreta para firmar tokens JWT',
		required: true,
		minLength: 64,
		envExample: 'your-64-character-minimum-secret-key-here',
	},
	JWT_REFRESH_SECRET: {
		description: 'Clave secreta para firmar refresh tokens',
		required: true,
		minLength: 64,
		envExample: 'your-64-character-minimum-refresh-secret',
	},
	ENCRYPTION_KEY: {
		description: 'Clave secreta para encriptar datos sensibles con AES-256-GCM',
		required: true,
		minLength: 32,
		envExample: 'your-32-character-minimum-encryption-key',
	},
	REDIS_URL: {
		description: 'URL de conexión a Redis',
		required: true,
		envExample: 'redis://localhost:6379',
	},
	DATABASE_HOST: {
		description: 'Host de la base de datos PostgreSQL',
		required: true,
		envExample: 'localhost o db (Docker)',
	},
	EMAIL_HOST: {
		description: 'Servidor SMTP para envío de correos',
		required: true,
		envExample: 'smtp.gmail.com',
	},
} as const;

export class EnvironmentVariables {
	@IsNumber()
	@Min(1)
	@Max(65535)
	declare PORT: number;

	@IsString()
	@MinLength(64, { message: 'JWT_SECRET debe tener al menos 64 caracteres' })
	declare JWT_SECRET: string;

	@IsString()
	@MinLength(64, {
		message: 'JWT_REFRESH_SECRET debe tener al menos 64 caracteres',
	})
	declare JWT_REFRESH_SECRET: string;

	@IsString()
	@MinLength(3)
	declare EMAIL_HOST: string;

	@IsEmail({}, { message: 'EMAIL_USER debe ser un correo válido' })
	declare EMAIL_USER: string;

	@IsString()
	@MinLength(1)
	declare EMAIL_PASS: string;

	@IsEnum(Environment)
	declare NODE_ENV: Environment;

	@IsString({ each: true })
	@Validate(IsCorsValidConstraint)
	declare CORS: string[];

	@IsString()
	declare DATABASE_DIALECT: Dialect;

	@IsString()
	@MinLength(1)
	declare DATABASE_HOST: string;

	@IsNumber()
	@Min(1)
	@Max(65535)
	declare DATABASE_PORT: number;

	@IsString()
	@MinLength(1)
	declare POSTGRES_USER: string;

	@IsString()
	@MinLength(1)
	declare POSTGRES_PASSWORD: string;

	@IsString()
	@MinLength(1)
	declare POSTGRES_DB: string;

	@IsNumber()
	@Min(1000)
	@Max(600000)
	declare RATE_LIMIT_TTL: number;

	@IsNumber()
	@Min(1)
	@Max(1000)
	declare RATE_LIMIT_LIMIT: number;

	@IsString()
	@MinLength(32, { message: 'ENCRYPTION_KEY debe tener al menos 32 caracteres' })
	declare ENCRYPTION_KEY: string;

	@IsString()
	@MinLength(5)
	declare REDIS_URL: string;

	@IsNumber()
	@Min(1)
	@Max(100)
	declare SALT_ROUNDS: number;

	@IsString()
	@MinLength(1)
	declare FRONT_END_URL: string;

	@IsString()
	@MinLength(1)
	declare DISABLE_SECURE_COOKIE: string;

	@IsString()
	@MinLength(1)
	declare ENABLE_CROSS_SITE_COOKIE: string;
}

export const validateEnv = (config: Record<string, unknown>) => {
	if (typeof config.CORS === 'string') {
		config.CORS = config.CORS.split(',').map(item => item.trim());
	}

	const numericFields = [
		'PORT',
		'SALT_ROUNDS',
		'DATABASE_PORT',
		'RATE_LIMIT_TTL',
		'RATE_LIMIT_LIMIT',
	];
	numericFields.forEach(field => {
		if (config[field] && typeof config[field] === 'string') {
			config[field] = parseInt(config[field], 10);
		}
	});

	const validatedConfig = plainToClass(EnvironmentVariables, config, {
		enableImplicitConversion: true,
	});

	const errors = validateSync(validatedConfig, {
		skipMissingProperties: false,
	});

	if (errors.length > 0) {
		const errorMessages = errors.map(err => {
			const constraints = Object.values(err.constraints ?? {}).join(', ');
			return `[${err.property}] ${constraints}`;
		});
		throw new Error(
			`Error de validación de configuración:\n${errorMessages.join('\n')}`,
		);
	}

	validateCriticalValues(validatedConfig);

	return validatedConfig;
};

function validateCriticalValues(config: EnvironmentVariables): void {
	const jwtSecret = config.JWT_SECRET;
	if (
		jwtSecret &&
		(jwtSecret.includes(' ') ||
			jwtSecret === 'password' ||
			jwtSecret === 'secret' ||
			jwtSecret === '12345678')
	) {
		throw new Error(
			'JWT_SECRET tiene un valor inseguro. Use una clave segura de al menos 64 caracteres.',
		);
	}

	if (config.NODE_ENV === Environment.Production) {
		if (config.JWT_SECRET.length < 64) {
			throw new Error(
				'JWT_SECRET debe tener al menos 64 caracteres en producción',
			);
		}
		if (config.DATABASE_HOST === 'localhost') {
			throw new Error('DATABASE_HOST no debe ser localhost en producción');
		}
	}

	if (config.RATE_LIMIT_TTL < 1000) {
		throw new Error('RATE_LIMIT_TTL debe ser mayor a 1000ms');
	}

	if (config.RATE_LIMIT_LIMIT > 1000) {
		throw new Error('RATE_LIMIT_LIMIT no puede exceder 1000');
	}
}
