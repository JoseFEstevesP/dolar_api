import { Environment, EnvironmentVariables } from '@/config/env.config';
import { ExtendedConflictException } from '@/exceptions/extended-conflict.exception';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { ExtendedUnauthorizedException } from '@/exceptions/extended-unauthorized.exception';
import { DataInfoJWT } from '@/functions/dataInfoJWT.d';
import { encrypt } from '@/functions/encrypt';
import { objectError } from '@/functions/objectError';
import { AuthAuditGateway } from '@/modules/security/auth/ports/auth-audit.gateway';
import { AuthUserGateway } from '@/modules/security/auth/ports/auth-user.gateway';
import { JwtService } from '@/services/jwt.service';
import { LoggerService } from '@/services/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare } from 'bcrypt';
import { Response } from 'express';
import { authMessages } from '../auth.messages';
import { AuthLoginDTO } from '../dto/authLogin.dto';

@Injectable()
export class LoginUseCase {
	constructor(
		private readonly authUserGateway: AuthUserGateway,
		private readonly authAuditGateway: AuthAuditGateway,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService<EnvironmentVariables>,
		private readonly logger: LoggerService,
	) {}

	async execute({
		data,
		res,
		loginInfo,
	}: {
		data: AuthLoginDTO;
		res: Response;
		loginInfo: DataInfoJWT;
	}) {
		const { email, password } = data;
		const user = await this.authUserGateway.findByEmail(email);

		if (!user) {
			this.logger.warn('Login fallido - usuario no encontrado', {
				type: 'auth_login',
				email,
				status: 'failed',
			});
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: authMessages.msg.credential }),
			);
		}

		if (!user.password) {
			this.logger.warn('Login fallido - usuario sin contraseña', {
				type: 'auth_login',
				userId: user.uid,
				email,
				status: 'failed',
			});
			throw new ExtendedUnauthorizedException(
				objectError({ name: 'all', msg: authMessages.msg.credential }),
			);
		}

		const checkPassword = await compare(password, user.password);
		if (!checkPassword) {
			this.logger.warn('Login fallido - contraseña inválida', {
				type: 'auth_login',
				userId: user.uid,
				email,
				status: 'failed',
			});
			await this.authUserGateway.validateAttempts(user.uid);
			throw new ExtendedUnauthorizedException(
				objectError({ name: 'all', msg: authMessages.msg.credential }),
			);
		}

		const accessToken = await this.generateAccessToken(user, loginInfo);
		const refreshToken = await this.generateRefreshToken(user, loginInfo);

		const loginInfoArray = Object.values(loginInfo);

		try {
			await this.authUserGateway.beginTransaction(async (t) => {
				await this.authUserGateway.resetAttempts(user.uid, t);
				await this.authAuditGateway.create(user.uid, refreshToken, loginInfoArray, t);
			});

			this.setCookies(res, accessToken, refreshToken);
		} catch (error) {
			this.logger.error(authMessages.log.sessionExisting, 'LoginUseCase', {
				type: 'auth_login',
				userId: user.uid,
				email,
				error: error instanceof Error ? error.message : 'Unknown error',
			});
			throw new ExtendedConflictException(
				objectError({ name: 'all', msg: authMessages.log.sessionExisting }),
			);
		}

		this.logger.info(
			`${user.surnames} ${user.names} - ${authMessages.log.loginSuccess}`,
			{
				type: 'auth_login',
				userId: user.uid,
				email,
				status: 'success',
			},
		);

		this.logger.logMetric('auth.login.exitoso', 1, { email });

		const encryptedRol = encrypt(
			JSON.stringify(user.rol),
			this.configService.get<string>('ENCRYPTION_KEY')!,
		);

		return { rol: encryptedRol };
	}

	private setCookies(res: Response, accessToken: string, refreshToken: string) {
		const isProduction = this.configService.get('NODE_ENV') === Environment.Production;

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
			secret: this.configService.get('JWT_SECRET'),
		});
	}

	private async generateRefreshToken(
		user: { uid: string },
		loginInfo: DataInfoJWT,
	) {
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
