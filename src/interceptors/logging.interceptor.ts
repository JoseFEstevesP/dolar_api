import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';
import { correlationIdHeader } from '../correlation-id/correlationId.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	constructor(
		private readonly logger: LoggerService,
	) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const req = context.switchToHttp().getRequest();
		const res = context.switchToHttp().getResponse();

		const correlationId =
			req[correlationIdHeader] || req.headers['x-correlation-id'];
		const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
		const { method, url } = req;

		const now = Date.now();

		this.logger.logRequest({ method, url, correlationId, ip });

		return next.handle().pipe(
			tap(() => {
				const responseTime = Date.now() - now;
				const { statusCode } = res;

				this.logger.logResponse(
					{ method, url, correlationId, ip },
					{ statusCode },
					responseTime,
				);

				this.logger.logSlowRequest(
					{ method, url, correlationId },
					responseTime,
				);
			}),
			catchError(err => {
				const responseTime = Date.now() - now;

				this.logger.error(
					`Error ${method} ${url} - ${err.message} - ${responseTime}ms`,
					'LoggingInterceptor',
					{
						correlationId,
						ip,
						method,
						url,
						statusCode: err.status || 500,
						responseTime,
						stack: err.stack,
					},
				);

				throw err;
			}),
		);
	}
}
