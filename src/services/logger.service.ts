import { Injectable } from '@nestjs/common';
import { createLogger, Logger, transports, format } from 'winston';
import 'winston-daily-rotate-file';

export interface LogContext {
	correlationId?: string;
	userId?: string;
	ip?: string;
	method?: string;
	url?: string;
	statusCode?: number;
	responseTime?: number;
	[key: string]: unknown;
}

export interface LogEntry {
	level: 'info' | 'warn' | 'error' | 'debug';
	message: string;
	timestamp: string;
	context?: string;
	correlationId?: string;
	userId?: string;
	ip?: string;
	method?: string;
	url?: string;
	statusCode?: number;
	responseTime?: number;
	metadata?: Record<string, unknown>;
}

@Injectable()
export class LoggerService {
	declare private loggerInfo: Logger;
	declare private loggerError: Logger;
	declare private loggerWarn: Logger;
	declare private loggerAll: Logger;
	private isDevelopment: boolean;

	constructor() {
		this.isDevelopment = process.env.NODE_ENV === 'development';
		this.createLoggers();
	}

	private createLoggers() {
		const jsonFormat = format.combine(
			format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
			format.json(),
		);

		const consoleFormat = format.combine(
			format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
			format.colorize(),
			format.printf(({ level, message, timestamp, context, ...metadata }) => {
				const meta = Object.keys(metadata).length
					? JSON.stringify(metadata)
					: '';
				const ctx = context ? `[${context}]` : '';
				return `${timestamp} ${level.toUpperCase()} ${ctx}: ${message} ${meta}`;
			}),
		);

		const transportsConfig = [
			new transports.DailyRotateFile({
				filename: 'logs/info/info-%DATE%.log',
				auditFile: 'logs/info/info-audit.json',
				datePattern: 'YYYY-MM-DD',
				maxFiles: '30d',
				maxSize: '10m',
				level: 'info',
			}),
		];

		const errorTransportsConfig = [
			new transports.DailyRotateFile({
				filename: 'logs/error/error-%DATE%.log',
				auditFile: 'logs/error/error-audit.json',
				datePattern: 'YYYY-MM-DD',
				maxFiles: '30d',
				maxSize: '10m',
				level: 'error',
			}),
		];

		const warnTransportsConfig = [
			new transports.DailyRotateFile({
				filename: 'logs/warn/warn-%DATE%.log',
				auditFile: 'logs/warn/warn-audit.json',
				datePattern: 'YYYY-MM-DD',
				maxFiles: '30d',
				maxSize: '10m',
				level: 'warn',
			}),
		];

		const allTransportsConfig = [
			new transports.DailyRotateFile({
				filename: 'logs/all/all-%DATE%.log',
				auditFile: 'logs/all/all-audit.json',
				datePattern: 'YYYY-MM-DD',
				maxFiles: '30d',
				maxSize: '20m',
			}),
		];

		if (this.isDevelopment) {
			allTransportsConfig.push(
				new transports.Console({
					format: consoleFormat,
				}) as unknown as (typeof transportsConfig)[number],
			);
			transportsConfig.push(
				new transports.Console({
					format: consoleFormat,
				}) as unknown as (typeof transportsConfig)[number],
			);
			errorTransportsConfig.push(
				new transports.Console({
					format: consoleFormat,
				}) as unknown as (typeof transportsConfig)[number],
			);
			warnTransportsConfig.push(
				new transports.Console({
					format: consoleFormat,
				}) as unknown as (typeof transportsConfig)[number],
			);
		}

		this.loggerInfo = createLogger({
			level: 'info',
			format: jsonFormat,
			transports: transportsConfig,
		});

		this.loggerError = createLogger({
			level: 'error',
			format: jsonFormat,
			transports: errorTransportsConfig,
		});

		this.loggerWarn = createLogger({
			level: 'warn',
			format: jsonFormat,
			transports: warnTransportsConfig,
		});

		this.loggerAll = createLogger({
			format: jsonFormat,
			transports: allTransportsConfig,
		});
	}

	log(message: string, context?: string, meta?: LogContext) {
		const logData = { context, ...meta };
		this.loggerAll.info(message, logData);
		this.loggerInfo.info(message, logData);
	}

	info(message: string, meta?: LogContext) {
		this.loggerAll.info(message, meta);
		this.loggerInfo.info(message, meta);
	}

	verbose(message: string, meta?: LogContext) {
		this.loggerAll.verbose(message, meta);
	}

	debug(message: string, meta?: LogContext) {
		this.loggerAll.debug(message, meta);
	}

	error(
		message: string,
		context?: string,
		meta?: LogContext & { stack?: string },
	) {
		const logData = { context, ...meta };
		this.loggerAll.error(message, logData);
		this.loggerError.error(message, logData);
	}

	warn(message: string, meta?: LogContext) {
		this.loggerAll.warn(message, meta);
		this.loggerWarn.warn(message, meta);
	}

	logRequest(req: {
		method: string;
		url: string;
		ip?: string;
		correlationId?: string;
		userId?: string;
	}) {
		this.info(`Request ${req.method} ${req.url}`, {
			correlationId: req.correlationId,
			userId: req.userId,
			ip: req.ip,
			method: req.method,
			url: req.url,
			type: 'request',
		});
	}

	logResponse(
		req: {
			method: string;
			url: string;
			correlationId?: string;
			userId?: string;
			ip?: string;
		},
		res: { statusCode: number },
		responseTime: number,
	) {
		let level = 'info';
		if (res.statusCode >= 500) {
			level = 'error';
		} else if (res.statusCode >= 400) {
			level = 'warn';
		}
		const logData = {
			correlationId: req.correlationId,
			userId: req.userId,
			ip: req.ip,
			method: req.method,
			url: req.url,
			statusCode: res.statusCode,
			responseTime,
			type: 'response',
		};

		if (level === 'error') {
			this.error(
				`Response ${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`,
				undefined,
				logData,
			);
		} else if (level === 'warn') {
			this.warn(
				`Response ${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`,
				logData,
			);
		} else {
			this.info(
				`Response ${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`,
				logData,
			);
		}
	}

	logError(error: Error, context?: string, meta?: LogContext) {
		this.error(error.message, context, {
			...meta,
			stack: error.stack,
			type: 'error',
			name: error.name,
		});
	}

	logMetric(metric: string, value: number, meta?: Record<string, unknown>) {
		this.info(`[METRIC] ${metric}: ${value}`, {
			type: 'metric',
			metric,
			value,
			...meta,
		});
	}

	logSlowRequest(
		req: {
			method: string;
			url: string;
			correlationId?: string;
		},
		responseTime: number,
		threshold: number = 3000,
	) {
		if (responseTime > threshold) {
			this.warn(
				`SLOW REQUEST: ${req.method} ${req.url} took ${responseTime}ms (threshold: ${threshold}ms)`,
				{
					correlationId: req.correlationId,
					method: req.method,
					url: req.url,
					responseTime,
					threshold,
					type: 'slow_request',
				},
			);
		}
	}
}
