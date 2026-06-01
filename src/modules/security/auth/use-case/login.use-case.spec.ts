import { ExtendedConflictException } from '@/exceptions/extended-conflict.exception';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { ExtendedUnauthorizedException } from '@/exceptions/extended-unauthorized.exception';
import { LoginUseCase } from './login.use-case';

vi.mock('bcrypt', () => ({ compare: vi.fn() }));
vi.mock('@/functions/encrypt', () => ({ encrypt: vi.fn() }));

describe('LoginUseCase', () => {
	const mockAuthUserGateway = {
		findByEmail: vi.fn(),
		validateAttempts: vi.fn(),
		resetAttempts: vi.fn(),
		beginTransaction: vi.fn(),
	};
	const mockAuthAuditGateway = { create: vi.fn() };
	const mockJwtService = { signAsync: vi.fn() };
	const mockConfigService = { get: vi.fn() };
	const mockLogger = {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		logMetric: vi.fn(),
	};

	let loginUseCase: LoginUseCase;

	const validUser = {
		uid: 'abc-123',
		password: '$2b$10$hashedpassword',
		attemptCount: 0,
		status: true,
		activatedAccount: true,
		uidRol: 'rol-1',
		surnames: 'Doe',
		names: 'John',
		email: 'john@test.com',
		provider: 'local',
		rol: { name: 'admin', permissions: ['read'] },
	};

	const execArgs = {
		data: { email: 'john@test.com', password: 'correct-password' },
		res: { cookie: vi.fn().mockReturnThis() },
		loginInfo: { ip: '127.0.0.1', userAgent: 'vitest', userPlatform: 'linux' },
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockConfigService.get.mockImplementation((key: string) => {
			if (key === 'ENCRYPTION_KEY') return 'test-encryption-key';
			if (key === 'JWT_SECRET') return 'jwt-secret';
			if (key === 'JWT_REFRESH_SECRET') return 'jwt-refresh-secret';
			if (key === 'NODE_ENV') return 'test';
			return null;
		});
		mockJwtService.signAsync.mockResolvedValue('jwt-token');
		mockAuthUserGateway.beginTransaction.mockImplementation(async (cb: any) => cb({}));
		loginUseCase = new LoginUseCase(
			mockAuthUserGateway as any,
			mockAuthAuditGateway as any,
			mockJwtService as any,
			mockConfigService as any,
			mockLogger as any,
		);
	});

	it('debe iniciar sesión exitosamente', async () => {
		const { compare } = await import('bcrypt');
		const { encrypt } = await import('@/functions/encrypt');
		(compare as any).mockResolvedValue(true);
		(encrypt as any).mockReturnValue('encrypted-rol');
		mockAuthUserGateway.findByEmail.mockResolvedValue(validUser);

		const result = await loginUseCase.execute(execArgs as any);

		expect(result).toEqual({ rol: 'encrypted-rol' });
		expect(mockAuthUserGateway.findByEmail).toHaveBeenCalledWith('john@test.com');
		expect(compare).toHaveBeenCalledWith('correct-password', validUser.password);
		expect(mockAuthUserGateway.validateAttempts).not.toHaveBeenCalled();
		expect(mockAuthUserGateway.beginTransaction).toHaveBeenCalled();
		expect(mockAuthAuditGateway.create).toHaveBeenCalledWith(
			'abc-123', 'jwt-token', ['127.0.0.1', 'vitest', 'linux'], {},
		);
		expect(execArgs.res.cookie).toHaveBeenCalledTimes(2);
		expect(mockLogger.info).toHaveBeenCalled();
		expect(mockLogger.logMetric).toHaveBeenCalledWith('auth.login.exitoso', 1, { email: 'john@test.com' });
	});

	it('debe lanzar ExtendedNotFoundException si el usuario no existe', async () => {
		mockAuthUserGateway.findByEmail.mockResolvedValue(null);

		await expect(loginUseCase.execute(execArgs as any)).rejects.toThrow(ExtendedNotFoundException);
		expect(mockLogger.warn).toHaveBeenCalled();
	});

	it('debe lanzar ExtendedUnauthorizedException si el usuario no tiene contraseña', async () => {
		mockAuthUserGateway.findByEmail.mockResolvedValue({ ...validUser, password: null });

		await expect(loginUseCase.execute(execArgs as any)).rejects.toThrow(ExtendedUnauthorizedException);
		expect(mockLogger.warn).toHaveBeenCalled();
	});

	it('debe lanzar ExtendedUnauthorizedException si la contraseña es incorrecta', async () => {
		const { compare } = await import('bcrypt');
		(compare as any).mockResolvedValue(false);
		mockAuthUserGateway.findByEmail.mockResolvedValue(validUser);

		await expect(loginUseCase.execute(execArgs as any)).rejects.toThrow(ExtendedUnauthorizedException);
		expect(mockAuthUserGateway.validateAttempts).toHaveBeenCalledWith('abc-123');
		expect(mockLogger.warn).toHaveBeenCalled();
	});

	it('debe lanzar ExtendedConflictException si falla la transacción', async () => {
		const { compare } = await import('bcrypt');
		(compare as any).mockResolvedValue(true);
		mockAuthUserGateway.findByEmail.mockResolvedValue(validUser);
		mockAuthUserGateway.beginTransaction.mockRejectedValue(new Error('Session exists'));

		await expect(loginUseCase.execute(execArgs as any)).rejects.toThrow(ExtendedConflictException);
		expect(mockLogger.error).toHaveBeenCalled();
	});

	it('debe establecer cookies seguras en producción', async () => {
		const { compare } = await import('bcrypt');
		(compare as any).mockResolvedValue(true);
		mockAuthUserGateway.findByEmail.mockResolvedValue(validUser);
		mockAuthUserGateway.beginTransaction.mockImplementation(async (cb: any) => cb({}));
		mockConfigService.get.mockImplementation((key: string) => {
			if (key === 'NODE_ENV') return 'production';
			if (key === 'ENCRYPTION_KEY') return 'key';
			if (key === 'JWT_SECRET') return 'secret';
			if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
			return null;
		});

		await loginUseCase.execute(execArgs as any);

		expect(execArgs.res.cookie).toHaveBeenCalledWith('accessToken', 'jwt-token', {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			maxAge: 3600 * 1000,
		});
	});
});
