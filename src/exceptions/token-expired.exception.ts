import { HttpException, HttpStatus } from '@nestjs/common';

export class TokenExpiredException extends HttpException {
	constructor(tokenType: 'access' | 'refresh') {
		super(
			{
				expired: true,
				tokenType,
				message:
					tokenType === 'access'
						? 'Token de acceso expirado'
						: 'Token de refresco expirado',
			},
			HttpStatus.UNAUTHORIZED,
		);
	}
}