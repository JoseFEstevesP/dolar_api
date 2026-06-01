import { GetUserCountsUseCase } from './getUserCounts.use-case';

describe('GetUserCountsUseCase', () => {
	const mockUserRepository = { count: vi.fn(), findAllWithOptions: vi.fn() };

	let useCase: GetUserCountsUseCase;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new GetUserCountsUseCase(mockUserRepository as any);
	});

	describe('countUsers', () => {
		it('debe retornar el conteo de usuarios sin filtro', async () => {
			mockUserRepository.count.mockResolvedValue(10);

			const result = await useCase.countUsers();

			expect(result).toBe(10);
			expect(mockUserRepository.count).toHaveBeenCalledWith({});
		});

		it('debe retornar el conteo de usuarios con filtro', async () => {
			mockUserRepository.count.mockResolvedValue(5);

			const result = await useCase.countUsers({ status: true });

			expect(result).toBe(5);
			expect(mockUserRepository.count).toHaveBeenCalledWith({ where: { status: true } });
		});
	});

	describe('countUsersByRole', () => {
		it('debe retornar conteo de usuarios agrupados por rol', async () => {
			mockUserRepository.findAllWithOptions.mockResolvedValue([
				{ uidRol: 'role-1', count: 5, 'rol.name': 'Admin' },
				{ uidRol: 'role-2', count: 3, 'rol.name': 'User' },
			]);

			const result = await useCase.countUsersByRole();

			expect(result).toEqual([
				{ rolName: 'Admin', count: 5 },
				{ rolName: 'User', count: 3 },
			]);
		});

		it('debe usar "Unknown" si el nombre del rol es undefined', async () => {
			mockUserRepository.findAllWithOptions.mockResolvedValue([
				{ uidRol: 'role-1', count: 2, 'rol.name': undefined },
			]);

			const result = await useCase.countUsersByRole();

			expect(result).toEqual([{ rolName: 'Unknown', count: 2 }]);
		});

		it('debe retornar array vacío cuando no hay resultados', async () => {
			mockUserRepository.findAllWithOptions.mockResolvedValue([]);

			const result = await useCase.countUsersByRole();

			expect(result).toEqual([]);
		});
	});
});
