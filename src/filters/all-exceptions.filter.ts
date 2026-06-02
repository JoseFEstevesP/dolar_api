import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { LoggerService } from '../services/logger.service';

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

		const httpStatus =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const message =
			exception instanceof HttpException
				? exception.message
				: 'Error interno del servidor';

		this.logger.error(
			`[${request.method}] ${request.url} - Status: ${httpStatus}`,
			exception instanceof Error ? exception.stack : JSON.stringify(exception),
		);

		if (!ctx.getResponse().headersSent) {
			httpAdapter.reply(ctx.getResponse(), {
				statusCode: httpStatus,
				message,
				timestamp: new Date().toISOString(),
			}, httpStatus);
		}
	}
}
