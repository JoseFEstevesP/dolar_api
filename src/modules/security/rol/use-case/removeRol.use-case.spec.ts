import { ExtendedConflictException } from '@/exceptions/extended-conflict.exception';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { RemoveRolUseCase } from './removeRol.use-case';

describe('RemoveRolUseCase', () => {
	const mockRolRepository = {
		findOne: vi.fn(),
		remove: vi.fn(),
	};
	const mockUserRepository = {
		findOne: vi.fn(),
	};
	const mockFindOneUserUseCase = {};
	const mockCacheService = {
		delPattern: vi.fn(),
	};

	let removeRolUseCase: RemoveRolUseCase;

	beforeEach(() => {
		vi.clearAllMocks();
		removeRolUseCase = new RemoveRolUseCase(
			mockRolRepository as any,
			mockUserRepository as any,
			mockFindOneUserUseCase as any,
			mockCacheService as any,
		);
	});

	it('should remove a role successfully', async () => {
		mockRolRepository.findOne.mockResolvedValue({
			uid: 'rol-123',
			name: 'Test Rol',
			status: true,
		});
		mockUserRepository.findOne.mockResolvedValue(null);
		mockRolRepository.remove.mockResolvedValue(undefined);
		mockCacheService.delPattern.mockResolvedValue(undefined);

		const result = await removeRolUseCase.execute({
			uid: 'rol-123',
			dataLog: 'admin',
		});

		expect(result).toEqual({ msg: 'Rol eliminado correctamente.' });
		expect(mockRolRepository.remove).toHaveBeenCalledWith('rol-123');
		expect(mockCacheService.delPattern).toHaveBeenCalledWith('role:pagination');
	});

	it('should throw ExtendedNotFoundException when role does not exist', async () => {
		mockRolRepository.findOne.mockResolvedValue(null);

		await expect(
			removeRolUseCase.execute({ uid: 'nonexistent', dataLog: 'admin' }),
		).rejects.toThrow(ExtendedNotFoundException);
	});

	it('should throw ExtendedConflictException when role has users assigned', async () => {
		mockRolRepository.findOne.mockResolvedValue({
			uid: 'rol-123',
			name: 'Test Rol',
			status: true,
		});
		mockUserRepository.findOne.mockResolvedValue({ uid: 'user-1' });

		await expect(
			removeRolUseCase.execute({ uid: 'rol-123', dataLog: 'admin' }),
		).rejects.toThrow(ExtendedConflictException);
	});
});
