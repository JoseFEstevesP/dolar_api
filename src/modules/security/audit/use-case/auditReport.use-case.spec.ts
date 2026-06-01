import { AuditReportUseCase } from './auditReport.use-case';

describe('AuditReportUseCase', () => {
	const mockAuditModel = { count: vi.fn() };

	let useCase: AuditReportUseCase;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new AuditReportUseCase(mockAuditModel as any);
	});

	describe('countDistinctUsers', () => {
		it('debe retornar el conteo de usuarios distintos en auditoría', async () => {
			mockAuditModel.count.mockResolvedValue(15);

			const result = await useCase.countDistinctUsers();

			expect(result).toBe(15);
			expect(mockAuditModel.count).toHaveBeenCalledWith({
				distinct: true,
				col: 'uidUser',
			});
		});

		it('debe retornar 0 cuando no hay registros', async () => {
			mockAuditModel.count.mockResolvedValue(0);

			const result = await useCase.countDistinctUsers();

			expect(result).toBe(0);
		});
	});
});
