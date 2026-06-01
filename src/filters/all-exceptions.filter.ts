import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { LoggerService } from '../services/logger.service';
import { authMessages } from '../modules/security/auth/auth.messages';
import { errorResponse } from '@/dto/api-response-wrapper.dto';

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

function isNamedException(
	exception: unknown,
	name: string,
): exception is { name: string; message: string } {
	return (
		exception !== null &&
		typeof exception === 'object' &&
		'name' in exception &&
		(exception as { name: string }).name === name
	);
}

function hasCustomResponse(
	exception: unknown,
): exception is HttpException & { getResponse: () => Record<string, unknown> } {
	return (
		exception instanceof HttpException &&
		typeof (exception as unknown as { getResponse: unknown }).getResponse === 'function'
	);
}

function parseObjectResponse(
	response: Record<string, unknown>,
): { message: string; details?: Record<string, { message: string }> } {
	const details: Record<string, { message: string }> = {};

	const extractDetails = (obj: Record<string, unknown>): boolean => {
		const keys = Object.keys(obj);
		if (keys.length === 0) return false;

		const firstVal = obj[keys[0]];
		if (
			typeof firstVal === 'object' &&
			firstVal !== null &&
			'message' in firstVal
		) {
			for (const key of keys) {
				const val = obj[key];
				if (typeof val === 'object' && val !== null && 'message' in val) {
					details[key] = { message: String(val.message) };
				}
			}
			return true;
		}
		return false;
	};

	if ('message' in response) {
		if (typeof response.message === 'string') {
			return { message: response.message };
		}
		if (Array.isArray(response.message)) {
			for (const err of response.message as Array<{
				property: string;
				constraints?: Record<string, string>;
			}>) {
				if (err.constraints) {
					details[err.property] = { message: Object.values(err.constraints)[0] };
				}
			}
			return { message: 'Error de validación', details };
		}
		if (typeof response.message === 'object' && response.message !== null) {
			const msg = response.message as Record<string, unknown>;
			if (extractDetails(msg)) {
				return { message: 'Error de validación', details };
			}
		}
	}

	if (!('message' in response) && extractDetails(response)) {
		return { message: 'Error de validación', details };
	}

	return { message: getHttpStatusName(HttpStatus.INTERNAL_SERVER_ERROR) };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	constructor(
		private readonly httpAdapterHost: HttpAdapterHost,
		private readonly logger: LoggerService,
	) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		const request = ctx.getRequest();

		if (this.tryHandleTokenExpired(exception, ctx, httpAdapter)) return;
		if (this.tryHandleThrottler(exception, ctx, httpAdapter, request)) return;

		const httpStatus =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		if (this.tryHandleCustomResponse(exception, ctx, httpAdapter, httpStatus, request)) {
			return;
		}

		this.handleDefault(exception, ctx, httpAdapter, httpStatus, request);
	}

	private tryHandleTokenExpired(
		exception: unknown,
		ctx: ReturnType<ArgumentsHost['switchToHttp']>,
		httpAdapter: { reply: (res: unknown, body: unknown, status: number) => void },
	): boolean {
		if (!isNamedException(exception, 'TokenExpiredError')) return false;

		const isRefreshToken = exception.message.includes('refresh');
		const tokenType = isRefreshToken ? 'refresh' : 'access';
		const message =
			tokenType === 'access'
				? 'Token de acceso expirado'
				: 'Token de refresco expirado';

		httpAdapter.reply(ctx.getResponse(), errorResponse(HttpStatus.UNAUTHORIZED, message, [
			{ field: 'token', message },
		]), HttpStatus.UNAUTHORIZED);
		return true;
	}

	private tryHandleThrottler(
		exception: unknown,
		ctx: ReturnType<ArgumentsHost['switchToHttp']>,
		httpAdapter: { reply: (res: unknown, body: unknown, status: number) => void },
		request: Record<string, unknown>,
	): boolean {
		if (!isNamedException(exception, 'ThrottlerException')) return false;

		this.logger.warn(
			`ThrottlerException: Demasiadas solicitudes - [${request.method}] ${request.url}`,
		);

		if (!ctx.getResponse().headersSent) {
			httpAdapter.reply(ctx.getResponse(), errorResponse(
				HttpStatus.TOO_MANY_REQUESTS,
				authMessages.throttler,
				[{ field: 'all', message: authMessages.throttler }],
			), HttpStatus.TOO_MANY_REQUESTS);
		}
		return true;
	}

	private tryHandleCustomResponse(
		exception: unknown,
		ctx: ReturnType<ArgumentsHost['switchToHttp']>,
		httpAdapter: { reply: (res: unknown, body: unknown, status: number) => void },
		httpStatus: number,
		request: Record<string, unknown>,
	): boolean {
		if (!hasCustomResponse(exception)) return false;

		const customResponse = exception.getResponse();
		if (
			customResponse &&
			typeof customResponse === 'object' &&
			'success' in customResponse &&
			customResponse.success === false
		) {
			this.logger.error(
				`[${request.method}] ${request.url} - Status: ${httpStatus}`,
				exception instanceof Error ? exception.stack : JSON.stringify(exception),
			);
			if (!ctx.getResponse().headersSent) {
				httpAdapter.reply(ctx.getResponse(), customResponse, httpStatus);
			}
			return true;
		}
		return false;
	}

	private handleDefault(
		exception: unknown,
		ctx: ReturnType<ArgumentsHost['switchToHttp']>,
		httpAdapter: { reply: (res: unknown, body: unknown, status: number) => void },
		httpStatus: number,
		request: Record<string, unknown>,
	): void {
		const exceptionResponse =
			exception instanceof HttpException
				? exception.getResponse()
				: 'Error interno del servidor';

		let message: string;
		let details: Record<string, { message: string }> | undefined;

		if (typeof exceptionResponse === 'string') {
			message = exceptionResponse;
		} else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
			const parsed = parseObjectResponse(exceptionResponse as Record<string, unknown>);
			message = parsed.message;
			details = parsed.details;
		} else {
			message = 'Error interno del servidor';
		}

		this.logger.error(
			`[${request.method}] ${request.url} - Status: ${httpStatus}`,
			exception instanceof Error ? exception.stack : JSON.stringify(exception),
		);

		if (!ctx.getResponse().headersSent) {
			httpAdapter.reply(ctx.getResponse(), errorResponse(httpStatus, message, details), httpStatus);
		}
	}
}
