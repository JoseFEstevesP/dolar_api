import { CheckSessionUseCase } from './checkSession.use-case';

vi.mock('@/functions/encrypt', () => ({ encrypt: vi.fn() }));

describe('CheckSessionUseCase', () => {
	const mockAuthAuditGateway = { findByRefreshToken: vi.fn() };
	const mockAuthUserGateway = { findById: vi.fn() };
	const mockConfigService = { get: vi.fn() };

	let useCase: CheckSessionUseCase;

	const mockAudit = {
		uid: 'a1',
		uidUser: 'u1',
		refreshToken: 'rt',
		dataToken: [],
	};

	const mockUser = {
		uid: 'u1',
		uidRol: 'r1',
		surnames: 'Doe',
		names: 'John',
		status: true,
		activatedAccount: true,
		email: 'john@test.com',
		provider: 'local',
		password: null,
		attemptCount: 0,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockConfigService.get.mockReturnValue('test-key');
		useCase = new CheckSessionUseCase(
			mockAuthAuditGateway as any,
			mockAuthUserGateway as any,
			mockConfigService as any,
		);
	});

	it('debe retornar no autenticado cuando no hay refreshToken', async () => {
		const result = await useCase.execute({});

		expect(result).toEqual({ isAuthenticated: false });
		expect(mockAuthAuditGateway.findByRefreshToken).not.toHaveBeenCalled();
	});

	it('debe retornar no autenticado cuando no se encuentra auditoría', async () => {
		mockAuthAuditGateway.findByRefreshToken.mockResolvedValue(null);

		const result = await useCase.execute({ refreshToken: 'invalid-token' });

		expect(result).toEqual({ isAuthenticated: false });
		expect(mockAuthAuditGateway.findByRefreshToken).toHaveBeenCalledWith('invalid-token');
	});

	it('debe retornar autenticado con rol cuando usuario y auditoría existen', async () => {
		const { encrypt } = await import('@/functions/encrypt');
		(encrypt as any).mockReturnValue('encrypted-rol');
		mockAuthAuditGateway.findByRefreshToken.mockResolvedValue(mockAudit);
		mockAuthUserGateway.findById.mockResolvedValue({ ...mockUser, rol: { name: 'admin', permissions: ['read'] } });

		const result = await useCase.execute({ refreshToken: 'valid-token' });

		expect(result).toEqual({ isAuthenticated: true, rol: 'encrypted-rol' });
		expect(encrypt).toHaveBeenCalledWith(JSON.stringify({ name: 'admin', permissions: ['read'] }), 'test-key');
	});

	it('debe retornar autenticado sin rol cuando el usuario no tiene rol', async () => {
		mockAuthAuditGateway.findByRefreshToken.mockResolvedValue(mockAudit);
		mockAuthUserGateway.findById.mockResolvedValue(mockUser);

		const result = await useCase.execute({ refreshToken: 'valid-token' });

		expect(result).toEqual({ isAuthenticated: true });
	});

	it('debe retornar autenticado sin rol cuando user.rol es undefined', async () => {
		const { encrypt } = await import('@/functions/encrypt');
		mockAuthAuditGateway.findByRefreshToken.mockResolvedValue(mockAudit);
		mockAuthUserGateway.findById.mockResolvedValue({ ...mockUser, rol: undefined });

		const result = await useCase.execute({ refreshToken: 'valid-token' });

		expect(result).toEqual({ isAuthenticated: true });
		expect(encrypt).not.toHaveBeenCalled();
	});
});
