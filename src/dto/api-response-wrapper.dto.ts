import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

const HTTP_STATUS_NAMES: Record<number, string> = {
	[HttpStatus.BAD_REQUEST]: 'Bad Request',
	[HttpStatus.UNAUTHORIZED]: 'Unauthorized',
	[HttpStatus.FORBIDDEN]: 'Forbidden',
	[HttpStatus.NOT_FOUND]: 'Not Found',
	[HttpStatus.CONFLICT]: 'Conflict',
	[HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
	[HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
	[HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
	[HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
};

function getHttpStatusName(code: number): string {
	return HTTP_STATUS_NAMES[code] || 'Error';
}

export class ApiErrorDetail {
	@ApiProperty({ example: 'email' })
	field!: string;

	@ApiProperty({ example: 'El correo electrónico es requerido' })
	message!: string;
}

export class ApiError {
	@ApiProperty({ enum: HttpStatus, example: HttpStatus.BAD_REQUEST })
	code!: number;

	@ApiProperty({ example: 'Bad Request' })
	name!: string;

	@ApiProperty({ example: 'El correo electrónico es requerido' })
	message!: string;

	@ApiPropertyOptional({ type: [ApiErrorDetail] })
	details?: ApiErrorDetail[];
}

export class ApiSuccessResponse<T> {
	@ApiProperty({ example: true })
	success!: boolean;

	@ApiProperty()
	data!: T;

	@ApiPropertyOptional({ example: 'Recurso creado exitosamente' })
	message?: string;
}

export class ApiErrorResponse {
	@ApiProperty({ example: false })
	success!: boolean;

	@ApiProperty({ type: ApiError })
	error!: ApiError;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T, message?: string): ApiSuccessResponse<T> {
	return {
		success: true,
		data,
		...(message && { message }),
	};
}

export function errorResponse(
	code: number,
	message: string,
	details?: Record<string, { message: string }> | ApiErrorDetail[],
): ApiErrorResponse {
	const error: ApiError = {
		code,
		name: getHttpStatusName(code),
		message,
	};

	if (details) {
		if (Array.isArray(details)) {
			error.details = details.map(d => {
				if ('field' in d && 'message' in d) {
					return { field: d.field, message: d.message };
				}
				const entry = d as Record<string, unknown>;
				const field = Object.keys(entry)[0];
				const value = entry[field] as { message: string };
				return { field, message: value.message };
			});
		} else {
			error.details = Object.entries(details).map(([field, value]) => ({
				field,
				message: typeof value === 'object' && value !== null && 'message' in value
					? (value as { message: string }).message
					: String(value),
			}));
		}
	}

	return {
		success: false,
		error,
	};
}

export function validationErrorResponse(
	details: Record<string, { message: string }>,
	message = 'Error de validación',
): ApiErrorResponse {
	return errorResponse(HttpStatus.BAD_REQUEST, message, details);
}

export function notFoundErrorResponse(
	resource: string,
	message?: string,
): ApiErrorResponse {
	return errorResponse(
		HttpStatus.NOT_FOUND,
		message || `${resource} no encontrado`,
	);
}

export function unauthorizedErrorResponse(message = 'No autorizado'): ApiErrorResponse {
	return errorResponse(HttpStatus.UNAUTHORIZED, message);
}

export function forbiddenErrorResponse(message = 'Acceso prohibido'): ApiErrorResponse {
	return errorResponse(HttpStatus.FORBIDDEN, message);
}

export function conflictErrorResponse(message: string): ApiErrorResponse {
	return errorResponse(HttpStatus.CONFLICT, message);
}