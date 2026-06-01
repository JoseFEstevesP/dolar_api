import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { UpdateRolUseCase } from './updateRol.use-case';

describe('UpdateRolUseCase', () => {
	const mockRolRepository = {
		findOne: vi.fn(),
		update: vi.fn(),
	};
	const mockCacheService = {
		delPattern: vi.fn(),
	};

	let updateRolUseCase: UpdateRolUseCase;

	beforeEach(() => {
		vi.clearAllMocks();
		updateRolUseCase = new UpdateRolUseCase(
			mockRolRepository as any,
			mockCacheService as any,
		);
	});

	it('should update a role successfully', async () => {
		mockRolRepository.findOne.mockResolvedValue({
			uid: 'rol-123',
			name: 'Old Name',
		});
		mockRolRepository.update.mockResolvedValue(undefined);
		mockCacheService.delPattern.mockResolvedValue(undefined);

		const result = await updateRolUseCase.execute({
			data: { uid: 'rol-123', name: 'New Name' } as any,
			dataLog: 'admin',
		});

		expect(result).toEqual({ msg: 'Rol actualizado correctamente.' });
		expect(mockRolRepository.update).toHaveBeenCalledWith('rol-123', {
			uid: 'rol-123',
			name: 'New Name',
		});
		expect(mockCacheService.delPattern).toHaveBeenCalledWith('role:pagination');
	});

	it('should throw ExtendedNotFoundException when role does not exist', async () => {
		mockRolRepository.findOne.mockResolvedValue(null);

		await expect(
			updateRolUseCase.execute({
				data: { uid: 'nonexistent' } as any,
				dataLog: 'admin',
			}),
		).rejects.toThrow(ExtendedNotFoundException);
	});
});
