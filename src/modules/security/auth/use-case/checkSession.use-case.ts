import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { encrypt } from '@/functions/encrypt';
import { AuthAuditGateway } from '@/modules/security/auth/ports/auth-audit.gateway';
import { AuthUserGateway } from '@/modules/security/auth/ports/auth-user.gateway';

@Injectable()
export class CheckSessionUseCase {
	private readonly logger = new Logger(CheckSessionUseCase.name);

	constructor(
		private readonly authAuditGateway: AuthAuditGateway,
		private readonly authUserGateway: AuthUserGateway,
		private readonly configService: ConfigService,
	) {}

	async execute({ refreshToken }: { refreshToken?: string }): Promise<{ isAuthenticated: boolean; rol?: string }> {
		if (!refreshToken) {
			this.logger.debug('CheckSession: No refreshToken provided');
			return { isAuthenticated: false };
		}

		const audit = await this.authAuditGateway.findByRefreshToken(refreshToken);

		if (!audit) {
			this.logger.debug('CheckSession: No active session found');
			return { isAuthenticated: false };
		}

		this.logger.debug('CheckSession: Active session found', {
			uidUser: audit.uidUser,
		});

		const user = await this.authUserGateway.findById(audit.uidUser);

		const encryptedRol = user?.rol
			? encrypt(JSON.stringify(user.rol), this.configService.get<string>('ENCRYPTION_KEY')!)
			: undefined;

		return { isAuthenticated: true, ...(encryptedRol && { rol: encryptedRol }) };
	}
}
