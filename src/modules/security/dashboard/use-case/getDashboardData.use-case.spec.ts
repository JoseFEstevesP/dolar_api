import { GetDashboardDataUseCase } from './getDashboardData.use-case';
import { DashboardResponseDTO } from '../dto/dashboard.dto';

describe('GetDashboardDataUseCase', () => {
	const mockAuditModel = { count: vi.fn() };
	const mockUserRepository = {
		count: vi.fn(),
		findAllWithOptions: vi.fn(),
	};
	const mockLoggerService = { logMetric: vi.fn() };

	let useCase: GetDashboardDataUseCase;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new GetDashboardDataUseCase(
			mockAuditModel as any,
			mockUserRepository as any,
			mockLoggerService as any,
		);
	});

	it('should return dashboard data', async () => {
		mockUserRepository.count
			.mockResolvedValueOnce(100)
			.mockResolvedValueOnce(80)
			.mockResolvedValueOnce(20)
			.mockResolvedValueOnce(90)
			.mockResolvedValueOnce(10);

		mockUserRepository.findAllWithOptions.mockResolvedValue([
			{ 'rol.name': 'Admin', uidRol: '1', count: 3 },
			{ 'rol.name': 'User', uidRol: '2', count: 50 },
		]);

		mockAuditModel.count.mockResolvedValue(15);

		const result: DashboardResponseDTO = await useCase.execute({
			dataLog: 'test-user',
		});

		expect(result.totalUsers).toBe(100);
		expect(result.usersByStatus).toEqual({ active: 80, inactive: 20 });
		expect(result.usersByActivation).toEqual({ activated: 90, pending: 10 });
		expect(result.usersByRole).toHaveLength(2);
		expect(result.usersByRole[0].rolName).toBe('Admin');
		expect(result.usersByRole[1].rolName).toBe('User');
		expect(result.activeUsers).toBe(15);
		expect(mockLoggerService.logMetric).toHaveBeenCalledWith(
			'dashboard.consultado',
			1,
		);
	});

	it('should handle empty users by role', async () => {
		mockUserRepository.count
			.mockResolvedValueOnce(0)
			.mockResolvedValueOnce(0)
			.mockResolvedValueOnce(0)
			.mockResolvedValueOnce(0)
			.mockResolvedValueOnce(0);

		mockUserRepository.findAllWithOptions.mockResolvedValue([]);
		mockAuditModel.count.mockResolvedValue(0);

		const result = await useCase.execute({ dataLog: 'test' });

		expect(result.usersByRole).toEqual([]);
		expect(result.activeUsers).toBe(0);
	});

	it('should handle errors gracefully', async () => {
		mockUserRepository.count.mockRejectedValue(new Error('DB error'));

		await expect(
			useCase.execute({ dataLog: 'test' }),
		).rejects.toThrow('DB error');
	});
});
