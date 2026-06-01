import { AuthAuditGateway } from '@/modules/security/auth/ports/auth-audit.gateway';
import { LoggerService } from '@/services/logger.service';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class LogoutUseCase {
	constructor(
		private readonly authAuditGateway: AuthAuditGateway,
		private readonly logger: LoggerService,
	) {}

	async execute({
		res,
		uid,
		dataLog,
	}: {
		uid?: string;
		res: Response;
		dataLog: string;
	}) {
		if (uid) {
			await this.authAuditGateway.removeByUser(uid, dataLog);
		}

		res.clearCookie('accessToken').clearCookie('refreshToken');

		this.logger.info('Usuario cerró sesión exitosamente', {
			type: 'auth_logout',
			userId: uid,
			status: 'success',
		});

		this.logger.logMetric('auth.logout.exitoso', 1);
	}
}
