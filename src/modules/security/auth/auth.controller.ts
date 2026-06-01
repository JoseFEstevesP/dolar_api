import { SkipThrottle, ThrottleAuth } from '@/decorators/rate-limit.decorator';
import { ReqUidDTO } from '@/dto/ReqUid.dto';
import {
	ApiErrorResponse,
	ApiTooManyRequestsResponse,
	ApiUnauthorizedResponse,
} from '@/dto/api-response.dto';
import { dataInfoJWT } from '@/functions/dataInfoJWT';
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { authMessages } from './auth.messages';
import { AuthLoginDTO } from './dto/authLogin.dto';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { CheckSessionUseCase } from './use-case/checkSession.use-case';
import { LoginUseCase } from './use-case/login.use-case';
import { LogoutUseCase } from './use-case/logout.use-case';
import { RefreshTokenUseCase } from './use-case/refreshToken.use-case';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name);

	constructor(
		private readonly loginUseCase: LoginUseCase,
		private readonly logoutUseCase: LogoutUseCase,
		private readonly refreshTokenUseCase: RefreshTokenUseCase,
		private readonly checkSessionUseCase: CheckSessionUseCase,
	) {}

	@ApiOperation({
		summary: 'Iniciar sesión',
		description: `
## Descripción
Autentica un usuario y devuelve tokens de acceso.

## Permisos requeridos
Ninguno - Endpoint público

## Ejemplo de petición
\`\`\`json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123"
}
\`\`\`
		`,
	})
	@ApiResponse({
		status: 201,
		description: 'Login exitoso - Devuelve tokens en cookies',
		example: {
			msg: 'Inicio de sesión exitoso',
			rol: 'iv:authTag:encryptedData',
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Datos de entrada inválidos',
		type: ApiErrorResponse,
	})
	@ApiResponse({
		status: 401,
		description: 'Credenciales incorrectas',
		type: ApiUnauthorizedResponse,
	})
	@ApiResponse({
		status: 429,
		description: 'Demasiadas peticiones',
		type: ApiTooManyRequestsResponse,
	})
	@HttpCode(HttpStatus.CREATED)
	@ThrottleAuth()
	@Post('/login')
	async login(
		@Body() data: AuthLoginDTO,
		@Res({ passthrough: true }) res: Response,
		@Req() req: Request & ReqUidDTO,
	) {
		this.logger.log(`system - ${authMessages.log.login}`);
		const { rol } = await this.loginUseCase.execute({
			data,
			res,
			loginInfo: dataInfoJWT(req),
		});
		return { msg: authMessages.msg.loginSuccess, rol };
	}

	@ApiOperation({
		summary: 'Cerrar sesión',
		description: `
## Descripción
Cierra la sesión del usuario actual invalidando el token de refresh.

## Permisos requeridos
- Bearer Token (JWT)
		`,
	})
	@ApiResponse({
		status: 200,
		description: 'Logout exitoso',
		example: {
			msg: 'Sesión cerrada exitosamente',
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Token no válido o expirado',
		type: ApiUnauthorizedResponse,
	})
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post('/logout')
	async logout(
		@Req() req: Request & ReqUidDTO,
		@Res({ passthrough: true }) res: Response,
	) {
		const { uid, dataLog } = req.user;
		this.logger.log(`${dataLog} - ${authMessages.log.logout}`);
		await this.logoutUseCase.execute({ uid, res, dataLog });
		return { msg: 'Sesión cerrada exitosamente' };
	}

	@ApiOperation({
		summary: 'Renovar token de acceso',
		description: `
## Descripción
Renueva el token de acceso usando el token de refresh guardado en cookies.

## Permisos requerions
Ninguno - Requiere cookie de refresh token

## Notas
- El refresh token se envía automáticamente en cookies
- Si el refresh token es válido, devuelve nuevos access y refresh tokens
		`,
	})
	@ApiResponse({
		status: 201,
		description: 'Token refrescado exitosamente',
		example: {
			msg: 'Token actualizado',
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Refresh token inválido o expirado',
		type: ApiUnauthorizedResponse,
	})
	@ApiResponse({
		status: 429,
		description: 'Demasiadas peticiones',
		type: ApiTooManyRequestsResponse,
	})
	@HttpCode(HttpStatus.CREATED)
	@Post('/refresh-token')
	async refreshToken(
		@Req() req: Request & ReqUidDTO,
		@Res({ passthrough: true }) res: Response,
	) {
		await this.refreshTokenUseCase.execute({
			req,
			res,
			loginInfo: dataInfoJWT(req),
		});
		return { msg: 'Token actualizado' };
	}

	@ApiOperation({
		summary: 'Verificar sesión activa',
		description: `
## Descripción
Verifica si el usuario tiene una sesión activa mediante el refresh token en cookies.

## Permisos requeridos
Ninguno - Requiere cookie refreshToken
		`,
	})
	@ApiResponse({
		status: 200,
		description: 'Sesión activa',
		example: {
			isAuthenticated: true,
		},
	})
	@ApiResponse({
		status: 200,
		description: 'Sesión no activa',
		example: {
			isAuthenticated: false,
		},
	})
	@Get('/check-session')
	@SkipThrottle()
	async checkSession(@Req() req: Request & ReqUidDTO) {
		const refreshToken = req.cookies?.refreshToken;
		return this.checkSessionUseCase.execute({ refreshToken });
	}
}
