import { EnvironmentVariables } from '@/config/env.config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jose from 'jose';

export interface JWTPayload {
	uid: string;
	uidRol?: string;
	dataLog?: string;
	[key: string]: unknown;
}

@Injectable()
export class JwtService {
	constructor(private readonly configService: ConfigService<EnvironmentVariables>) {}

	async signAsync(
		payload: JWTPayload,
		options?: { expiresIn?: string; secret?: string },
	): Promise<string> {
		const secret = options?.secret ?? this.configService.get('JWT_SECRET') ?? 'default-secret';
		const expiresIn = options?.expiresIn ?? '1h';

		const alg = 'HS256';
		const key = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret)));

		const jwt = await new jose.SignJWT(payload as jose.JWTPayload)
			.setProtectedHeader({ alg })
			.setIssuedAt()
			.setExpirationTime(expiresIn)
			.sign(key);

		return jwt;
	}

	async verifyAsync(token: string, options?: { secret?: string }): Promise<JWTPayload> {
		const secret = options?.secret ?? this.configService.get('JWT_SECRET') ?? 'default-secret';

		const key = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret)));

		const { payload } = await jose.jwtVerify(token, key);

		return payload as JWTPayload;
	}

	async verifyRefreshToken(token: string): Promise<JWTPayload> {
		const secret =
			this.configService.get('JWT_REFRESH_SECRET') ?? this.configService.get('JWT_SECRET') ?? 'default-secret';

		const key = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret)));

		const { payload } = await jose.jwtVerify(token, key);

		return payload as JWTPayload;
	}

	async decodeToken(token: string): Promise<JWTPayload | null> {
		try {
			const decoded = jose.decodeJwt(token);
			return decoded as JWTPayload;
		} catch {
			return null;
		}
	}

	isTokenExpired(token: string): boolean {
		try {
			const decoded = jose.decodeJwt(token);
			if (!decoded.exp) return false;
			return decoded.exp * 1000 < Date.now();
		} catch {
			return true;
		}
	}
}
