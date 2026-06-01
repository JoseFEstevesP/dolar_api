import { Role } from '@/modules/security/rol/entities/rol.entity';
import { UserAuthAdapter } from './user-auth.adapter';

describe('UserAuthAdapter', () => {
	const mockFindUserForAuthUseCase = { execute: vi.fn() };
	const mockValidateAttemptUseCase = { execute: vi.fn() };
	const mockUserRepository = {
		findOne: vi.fn(),
		update: vi.fn(),
		transaction: vi.fn(),
	};

	let adapter: UserAuthAdapter;

	const mockUser = {
		uid: 'abc-123',
		password: 'hashed-password',
		attemptCount: 0,
		status: true,
		activatedAccount: true,
		uidRol: 'rol-1',
		surnames: 'Doe',
		names: 'John',
		email: 'john@test.com',
		provider: 'local',
		rol: { name: 'admin', permissions: ['read', 'write'] } as Role,
	};

	const expectedAuthData = {
		uid: 'abc-123',
		password: 'hashed-password',
		attemptCount: 0,
		status: true,
		activatedAccount: true,
		uidRol: 'rol-1',
		surnames: 'Doe',
		names: 'John',
		email: 'john@test.com',
		provider: 'local',
		rol: { name: 'admin', permissions: ['read', 'write'] },
	};

	beforeEach(() => {
		vi.clearAllMocks();
		adapter = new UserAuthAdapter(
			mockFindUserForAuthUseCase as any,
			mockValidateAttemptUseCase as any,
			mockUserRepository as any,
		);
	});

	describe('findByEmail', () => {
		it('debe retornar AuthUserData cuando el usuario existe', async () => {
			mockFindUserForAuthUseCase.execute.mockResolvedValue(mockUser);

			const result = await adapter.findByEmail('john@test.com');

			expect(mockFindUserForAuthUseCase.execute).toHaveBeenCalledWith('john@test.com');
			expect(result).toEqual(expectedAuthData);
		});

		it('debe retornar null cuando el usuario no existe', async () => {
			mockFindUserForAuthUseCase.execute.mockResolvedValue(null);

			const result = await adapter.findByEmail('notfound@test.com');

			expect(result).toBeNull();
		});
	});

	describe('findById', () => {
		it('debe retornar AuthUserData cuando el usuario existe', async () => {
			mockUserRepository.findOne.mockResolvedValue(mockUser);

			const result = await adapter.findById('abc-123');

			expect(mockUserRepository.findOne).toHaveBeenCalledWith({
				where: { uid: 'abc-123' },
				include: [{ model: Role, attributes: ['name', 'permissions'] }],
			});
			expect(result).toEqual(expectedAuthData);
		});

		it('debe retornar null cuando el usuario no existe', async () => {
			mockUserRepository.findOne.mockResolvedValue(null);

			const result = await adapter.findById('abc-123');

			expect(result).toBeNull();
		});

		it('debe manejar usuario sin rol', async () => {
			mockUserRepository.findOne.mockResolvedValue({ ...mockUser, rol: undefined });

			const result = await adapter.findById('abc-123');

			expect(result!.rol).toBeUndefined();
		});
	});

	describe('validateAttempts', () => {
		it('debe validar intentos cuando el usuario existe', async () => {
			mockUserRepository.findOne.mockResolvedValue(mockUser);

			await adapter.validateAttempts('abc-123');

			expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { uid: 'abc-123' } });
			expect(mockValidateAttemptUseCase.execute).toHaveBeenCalledWith({ user: mockUser });
		});

		it('debe no hacer nada cuando el usuario no existe', async () => {
			mockUserRepository.findOne.mockResolvedValue(null);

			await adapter.validateAttempts('abc-123');

			expect(mockValidateAttemptUseCase.execute).not.toHaveBeenCalled();
		});
	});

	describe('resetAttempts', () => {
		it('debe resetear intentos a cero', async () => {
			await adapter.resetAttempts('abc-123');

			expect(mockUserRepository.update).toHaveBeenCalledWith('abc-123', { attemptCount: 0 }, undefined);
		});

		it('debe pasar la transacción cuando se provee', async () => {
			const mockTransaction = {} as any;

			await adapter.resetAttempts('abc-123', mockTransaction);

			expect(mockUserRepository.update).toHaveBeenCalledWith('abc-123', { attemptCount: 0 }, mockTransaction);
		});
	});

	describe('beginTransaction', () => {
		it('debe delegar a userRepository.transaction', async () => {
			const callback = vi.fn().mockResolvedValue('result');
			mockUserRepository.transaction.mockImplementation(async (cb: any) => cb());

			const result = await adapter.beginTransaction(callback);

			expect(mockUserRepository.transaction).toHaveBeenCalled();
			expect(result).toBe('result');
		});
	});
});
