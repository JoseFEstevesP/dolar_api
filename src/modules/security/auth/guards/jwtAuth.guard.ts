import { TokenExpiredException } from '@/exceptions/token-expired.exception';
import { PayloadJWT } from '@/modules/security/auth/types';
import { JwtService } from '@/services/jwt.service';
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const token = request.cookies?.accessToken;

		if (!token) {
			throw new UnauthorizedException('No autenticado');
		}

		try {
			const payload = (await this.jwtService.verifyAsync(token)) as PayloadJWT;
			request.user = payload;
			return true;
		} catch {
			if (this.jwtService.isTokenExpired(token)) {
				throw new TokenExpiredException('access');
			}
			throw new UnauthorizedException('Token inválido');
		}
	}
}
