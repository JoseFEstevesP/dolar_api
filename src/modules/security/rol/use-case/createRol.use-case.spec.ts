import { CreateRolUseCase } from './createRol.use-case';

vi.mock('@/functions/validationFunction/validatePropertyData');

describe('CreateRolUseCase', () => {
	const mockRolRepository = {
		findOne: vi.fn(),
		create: vi.fn(),
	};
	const mockCacheService = {
		delPattern: vi.fn(),
	};

	let createRolUseCase: CreateRolUseCase;

	beforeEach(() => {
		vi.clearAllMocks();
		createRolUseCase = new CreateRolUseCase(
			mockRolRepository as any,
			mockCacheService as any,
		);
	});

	it('should create a new role successfully', async () => {
		mockRolRepository.findOne.mockResolvedValue(null);
		mockRolRepository.create.mockResolvedValue(undefined);
		mockCacheService.delPattern.mockResolvedValue(undefined);

		const result = await createRolUseCase.execute({
			data: {
				name: 'Test Rol',
				description: 'Test Description',
				permissions: ['USER_READ'],
			} as any,
			dataLog: 'admin',
		});

		expect(result).toEqual({ msg: 'Rol creado correctamente.' });
		expect(mockRolRepository.create).toHaveBeenCalled();
		expect(mockCacheService.delPattern).toHaveBeenCalledWith('role:pagination');
	});

	it('should check for existing role before creating', async () => {
		mockRolRepository.findOne.mockResolvedValue({ name: 'Test Rol' });

		const { validatePropertyData } = await import(
			'@/functions/validationFunction/validatePropertyData'
		);
		(validatePropertyData as any).mockImplementation(() => {
			throw new Error('El rol ya existe');
		});

		await expect(
			createRolUseCase.execute({
				data: { name: 'Test Rol' } as any,
				dataLog: 'admin',
			}),
		).rejects.toThrow('El rol ya existe');
	});
});
