import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
	const mockAuthAuditGateway = { removeByUser: vi.fn() };
	const mockLogger = { info: vi.fn(), logMetric: vi.fn() };
	const mockRes = { clearCookie: vi.fn().mockReturnThis() };

	let useCase: LogoutUseCase;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new LogoutUseCase(mockAuthAuditGateway as any, mockLogger as any);
	});

	it('debe limpiar cookies y registrar métrica', async () => {
		await useCase.execute({ res: mockRes as any, dataLog: 'user-logout' });

		expect(mockAuthAuditGateway.removeByUser).not.toHaveBeenCalled();
		expect(mockRes.clearCookie).toHaveBeenCalledWith('accessToken');
		expect(mockRes.clearCookie).toHaveBeenCalledWith('refreshToken');
		expect(mockLogger.info).toHaveBeenCalled();
		expect(mockLogger.logMetric).toHaveBeenCalledWith('auth.logout.exitoso', 1);
	});

	it('debe eliminar registros de auditoría cuando se provee uid', async () => {
		await useCase.execute({ uid: 'abc-123', res: mockRes as any, dataLog: 'system' });

		expect(mockAuthAuditGateway.removeByUser).toHaveBeenCalledWith('abc-123', 'system');
		expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
	});

	it('debe no llamar removeByUser cuando uid es undefined', async () => {
		await useCase.execute({ res: mockRes as any, dataLog: 'expired' });

		expect(mockAuthAuditGateway.removeByUser).not.toHaveBeenCalled();
	});
});
