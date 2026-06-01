import { EnvironmentVariables } from '@/config/env.config';
import { DataInfoJWT } from '@/functions/dataInfoJWT.d';
import { AuthAuditGateway } from '@/modules/security/auth/ports/auth-audit.gateway';
import { AuthUserGateway } from '@/modules/security/auth/ports/auth-user.gateway';
import { TokenExpiredException } from '@/exceptions/token-expired.exception';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@/services/jwt.service';
import { Request, Response } from 'express';
import { LoggerService } from '@/services/logger.service';
import { LogoutUseCase } from './logout.use-case';

@Injectable()
export class RefreshTokenUseCase {
	constructor(
		private readonly authAuditGateway: AuthAuditGateway,
		private readonly authUserGateway: AuthUserGateway,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<EnvironmentVariables>,
		private readonly logoutUseCase: LogoutUseCase,
		private readonly logger: LoggerService,
	) {}

	async execute({
		req,
		res,
		loginInfo,
	}: {
		req: Request;
		res: Response;
		loginInfo: DataInfoJWT;
	}) {
		const refreshToken = req.cookies?.refreshToken;

		if (!refreshToken) {
			this.logger.warn('Refresh token no proporcionado', {
				type: 'auth_refresh_token',
				status: 'failed',
			});
			res.status(401).json({
				expired: true,
				tokenType: 'refresh',
				message: 'Token de refresco no encontrado. Inicie sesión nuevamente.',
			});
			return;
		}

		try {
			await this.jwtService.verifyAsync(refreshToken, {
				secret: this.configService.get('JWT_REFRESH_SECRET'),
			});
		} catch (err) {
			const error = err as { name?: string };
			if (error?.name === 'TokenExpiredError') {
				throw new TokenExpiredException('refresh');
			}
			throw err;
		}

		const loginInfoArray = Object.values(loginInfo);
		const auditRef = await this.authAuditGateway.findByRefreshToken(refreshToken, loginInfoArray);

		if (!auditRef) {
			this.logger.warn('Refresh token no encontrado en auditoría', {
				type: 'auth_refresh_token',
				status: 'failed',
			});
			return this.logoutUseCase.execute({
				res,
				dataLog: 'system',
			});
		}

		const user = await this.authUserGateway.findById(auditRef.uidUser);

		if (!user) {
			this.logger.warn('Usuario no encontrado para refresh token', {
				type: 'auth_refresh_token',
				uidUser: auditRef.uidUser,
				status: 'failed',
			});
			return this.logoutUseCase.execute({
				uid: auditRef.uidUser,
				res,
				dataLog: 'system',
			});
		}

		if (refreshToken !== auditRef.refreshToken) {
			this.logger.warn('Refresh token no coincide', {
				type: 'auth_refresh_token',
				userId: user.uid,
				status: 'failed',
			});
			return this.logoutUseCase.execute({
				uid: auditRef.uidUser,
				res,
				dataLog: 'system',
			});
		}

		const newAccessToken = await this.generateAccessToken(user, loginInfo);
		const newRefreshToken = await this.generateRefreshToken(user, loginInfo);

		await this.authAuditGateway.updateToken(auditRef.uid, newRefreshToken);

		this.setCookies(res, newAccessToken, newRefreshToken);

		this.logger.info('Tokens renovados exitosamente', {
			type: 'auth_refresh_token',
			userId: user.uid,
			status: 'success',
		});

		this.logger.logMetric('auth.refresh_token.exitoso', 1);
	}

	private setCookies(res: Response, accessToken: string, refreshToken: string) {
		const isProduction = this.configService.get('NODE_ENV') === 'production';

		res
			.cookie('accessToken', accessToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? 'none' : 'lax',
				maxAge: 3600 * 1000,
			})
			.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? 'none' : 'lax',
				maxAge: 7 * 24 * 3600 * 1000,
			});
	}

	private async generateAccessToken(
		user: { uid: string; uidRol: string; surnames: string; names: string },
		loginInfo: DataInfoJWT,
	) {
		const dataToken = {
			uid: user.uid,
			uidRol: user.uidRol,
			dataLog: `${user.surnames} ${user.names}`,
			...loginInfo,
		};

		return this.jwtService.signAsync(dataToken, {
			expiresIn: '1h',
			secret: process.env.JWT_SECRET,
		});
	}

	private async generateRefreshToken(user: { uid: string }, loginInfo: DataInfoJWT) {
		const dataToken = {
			uid: user.uid,
			...loginInfo,
		};

		return this.jwtService.signAsync(dataToken, {
			expiresIn: '7d',
			secret: this.configService.get('JWT_REFRESH_SECRET'),
		});
	}
}
