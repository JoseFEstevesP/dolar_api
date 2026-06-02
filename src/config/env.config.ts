import { plainToClass } from 'class-transformer';
import {
	IsEnum,
	IsNumber,
	IsString,
	Max,
	Min,
	MinLength,
	Validate,
	validateSync,
} from 'class-validator';
import { IsCorsValidConstraint } from './isCorsValid';

export enum Environment {
	Development = 'development',
	Production = 'production',
	Test = 'test',
}

export class EnvironmentVariables {
	@IsNumber()
	@Min(1)
	@Max(65535)
	declare PORT: number;

	@IsEnum(Environment)
	declare NODE_ENV: Environment;

	@IsString({ each: true })
	@Validate(IsCorsValidConstraint)
	declare CORS: string[];
}

export const validateEnv = (config: Record<string, unknown>) => {
	if (typeof config.CORS === 'string') {
		config.CORS = config.CORS.split(',').map(item => item.trim());
	}

	const numericFields = ['PORT'];
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

	return validatedConfig;
};
