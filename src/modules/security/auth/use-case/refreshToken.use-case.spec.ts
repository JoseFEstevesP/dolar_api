import { TokenExpiredException } from '@/exceptions/token-expired.exception';
import { RefreshTokenUseCase } from './refreshToken.use-case';

describe('RefreshTokenUseCase', () => {
	const mockAuthUserGateway = { findById: vi.fn() };
	const mockAuthAuditGateway = {
		findByRefreshToken: vi.fn(),
		updateToken: vi.fn(),
	};
	const mockJwtService = { signAsync: vi.fn(), verifyAsync: vi.fn() };
	const mockConfigService = { get: vi.fn() };
	const mockLogoutUseCase = { execute: vi.fn() };
	const mockLogger = {
		info: vi.fn(),
		warn: vi.fn(),
		logMetric: vi.fn(),
	};

	let useCase: RefreshTokenUseCase;

	const mockReq = { cookies: { refreshToken: 'valid-refresh-token' } };
	const mockRes = {
		cookie: vi.fn().mockReturnThis(),
		clearCookie: vi.fn().mockReturnThis(),
		status: vi.fn().mockReturnThis(),
		json: vi.fn(),
	};
	const loginInfo = { ip: '127.0.0.1', userAgent: 'vitest', userPlatform: 'linux' };

	const mockUser = {
		uid: 'abc-123',
		uidRol: 'rol-1',
		surnames: 'Doe',
		names: 'John',
		status: true,
		activatedAccount: true,
	};

	const mockAudit = {
		uid: 'audit-1',
		uidUser: 'abc-123',
		refreshToken: 'valid-refresh-token',
		dataToken: ['127.0.0.1', 'vitest', 'linux'],
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockJwtService.signAsync.mockResolvedValue('new-jwt-token');
		mockJwtService.verifyAsync.mockResolvedValue({ uid: 'abc-123' });
		mockConfigService.get.mockImplementation((key: string) => {
			if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
			if (key === 'JWT_SECRET') return 'jwt-secret';
			if (key === 'ENCRYPTION_KEY') return 'key';
			if (key === 'NODE_ENV') return 'test';
			return null;
		});
		useCase = new RefreshTokenUseCase(
			mockAuthAuditGateway as any,
			mockAuthUserGateway as any,
			mockJwtService as any,
			mockConfigService as any,
			mockLogoutUseCase as any,
			mockLogger as any,
		);
	});

	it('debe renovar los tokens exitosamente', async () => {
		mockAuthAuditGateway.findByRefreshToken.mockResolvedValue(mockAudit);
		mockAuthUserGateway.findById.mockResolvedValue(mockUser);

		await useCase.execute({ req: mockReq as any, res: mockRes as any, loginInfo });

		expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-refresh-token', { secret: 'refresh-secret' });
		expect(mockAuthAuditGateway.findByRefreshToken).toHaveBeenCalledWith('valid-refresh-token', [
			'127.0.0.1', 'vitest', 'linux',
		]);
		expect(mockAuthUserGateway.findById).toHaveBeenCalledWith('abc-123');
		expect(mockAuthAuditGateway.updateToken).toHaveBeenCalledWith('audit-1', 'new-jwt-token');
		expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
		expect(mockRes.cookie).toHaveBeenCalledTimes(2);
		expect(mockLogger.info).toHaveBeenCalled();
		expect(mockLogger.logMetric).toHaveBeenCalledWith('auth.refresh_token.exitoso', 1);
	});

	it('debe responder 401 cuando no hay cookie refreshToken', async () => {
		await useCase.execute({ req: { cookies: {} } as any, res: mockRes as any, loginInfo });

		expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
		expect(mockRes.status).toHaveBeenCalledWith(401);
		expect(mockRes.json).toHaveBeenCalledWith({
			expired: true,
			tokenType: 'refresh',
			message: 'Token de refresco no encontrado. Inicie sesión nuevamente.',
		});
		expect(mockLogger.warn).toHaveBeenCalled();
	});

	it('debe lanzar TokenExpiredException cuando el token expiró', async () => {
		mockJwtService.verifyAsync.mockRejectedValue({ name: 'TokenExpiredError' });

		await expect(
			useCase.execute({ req: mockReq as any, res: mockRes as any, loginInfo }),
		).rejects.toThrow(TokenExpiredException);
	});

	it('debe relanzar errores que no son de expiración', async () => {
		mockJwtService.verifyAsync.mockRejectedValue(new Error('JWT verification failed'));

		await expect(
			useCase.execute({ req: mockReq as any, res: mockRes as any, loginInfo }),
		).rejects.toThrow('JWT verification failed');
	});

	it('debe hacer logout cuando no se encuentra el auditoría', async () => {
		mockAuthAuditGateway.findByRefreshToken.mockResolvedValue(null);

		await useCase.execute({ req: mockReq as any, res: mockRes as any, loginInfo });

		expect(mockLogoutUseCase.execute).toHaveBeenCalledWith({ res: mockRes, dataLog: 'system' });
		expect(mockLogger.warn).toHaveBeenCalled();
	});

	it('debe hacer logout cuando el usuario no existe', async () => {
		mockAuthAuditGateway.findByRefreshToken.mockResolvedValue(mockAudit);
		mockAuthUserGateway.findById.mockResolvedValue(null);

		await useCase.execute({ req: mockReq as any, res: mockRes as any, loginInfo });

		expect(mockLogoutUseCase.execute).toHaveBeenCalledWith({ uid: 'abc-123', res: mockRes, dataLog: 'system' });
	});

	it('debe hacer logout cuando el refresh token no coincide', async () => {
		mockAuthAuditGateway.findByRefreshToken.mockResolvedValue({ ...mockAudit, refreshToken: 'different-token' });
		mockAuthUserGateway.findById.mockResolvedValue(mockUser);

		await useCase.execute({ req: mockReq as any, res: mockRes as any, loginInfo });

		expect(mockLogoutUseCase.execute).toHaveBeenCalledWith({ uid: 'abc-123', res: mockRes, dataLog: 'system' });
	});
});
