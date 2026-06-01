import { FindAllUserPaginationUseCase } from './findAllUserPagination.use-case';

describe('FindAllUserPaginationUseCase', () => {
	const mockUserRepository = { findAndCountAll: vi.fn() };
	const mockLogger = { info: vi.fn(), logMetric: vi.fn() };

	let useCase: FindAllUserPaginationUseCase;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new FindAllUserPaginationUseCase(mockUserRepository as any, mockLogger as any);
	});

	const defaultFilter = {
		limit: 30,
		page: 1,
		orderProperty: 'email' as any,
		order: 'ASC' as any,
	};

	it('debe retornar resultados paginados', async () => {
		const mockRows = [{ uid: 'u1', names: 'John', toJSON: () => ({ uid: 'u1', names: 'John' }) }];
		mockUserRepository.findAndCountAll.mockResolvedValue({ rows: mockRows, count: 1 });

		const result = await useCase.execute({
			filter: defaultFilter,
			uidUser: 'current-user',
			dataLog: '[test]',
		});

		expect(result.rows).toHaveLength(1);
		expect(result.count).toBe(1);
		expect(result.currentPage).toBe(1);
		expect(mockLogger.info).toHaveBeenCalled();
		expect(mockLogger.logMetric).toHaveBeenCalledWith('usuario.buscar_todos', 1);
	});

	it('debe aplicar paginación correctamente', async () => {
		mockUserRepository.findAndCountAll.mockResolvedValue({ rows: [], count: 50 });

		const result = await useCase.execute({
			filter: { ...defaultFilter, limit: 10, page: 2 },
			uidUser: 'current-user',
			dataLog: '[test]',
		});

		expect(result.limit).toBe(10);
		expect(result.currentPage).toBe(2);
		expect(result.pages).toBe(5);
	});

	it('debe excluir al usuario actual de los resultados', async () => {
		mockUserRepository.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

		await useCase.execute({
			filter: defaultFilter,
			uidUser: 'current-user',
			dataLog: '[test]',
		});

		const options = mockUserRepository.findAndCountAll.mock.calls[0][0];
		expect(options.where.uid).toEqual(expect.objectContaining({}));
	});

	it('debe limitar el maximo de resultados a 100', async () => {
		mockUserRepository.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

		await useCase.execute({
			filter: { ...defaultFilter, limit: 500 },
			uidUser: 'current-user',
			dataLog: '[test]',
		});

		const options = mockUserRepository.findAndCountAll.mock.calls[0][0];
		expect(options.limit).toBe(100);
	});
});
