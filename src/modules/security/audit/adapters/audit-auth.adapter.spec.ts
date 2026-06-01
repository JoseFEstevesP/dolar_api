import { AuditAuthAdapter } from './audit-auth.adapter';

describe('AuditAuthAdapter', () => {
	const mockCreateAuditUseCase = { execute: vi.fn().mockResolvedValue({}) };
	const mockFindOneAuditUseCase = { execute: vi.fn() };
	const mockUpdateAuditUseCase = { execute: vi.fn().mockResolvedValue({}) };
	const mockRemoveAuditUseCase = { execute: vi.fn().mockResolvedValue({}) };

	let adapter: AuditAuthAdapter;

	beforeEach(() => {
		vi.clearAllMocks();
		adapter = new AuditAuthAdapter(
			mockCreateAuditUseCase as any,
			mockFindOneAuditUseCase as any,
			mockUpdateAuditUseCase as any,
			mockRemoveAuditUseCase as any,
			{} as any,
		);
	});

	describe('create', () => {
		it('debe crear auditoría vía use case', async () => {
			await adapter.create('abc-123', 'refresh-token', ['ip-1', 'user-agent']);

			expect(mockCreateAuditUseCase.execute).toHaveBeenCalledWith(
				{ data: { uidUser: 'abc-123', refreshToken: 'refresh-token', dataToken: ['ip-1', 'user-agent'] } },
				undefined,
			);
		});

		it('debe pasar la transacción cuando se provee', async () => {
			const mockTransaction = { LOCK: {} } as any;

			await adapter.create('abc-123', 'refresh-token', ['ip-1'], mockTransaction);

			expect(mockCreateAuditUseCase.execute).toHaveBeenCalledWith(
				{ data: { uidUser: 'abc-123', refreshToken: 'refresh-token', dataToken: ['ip-1'] } },
				mockTransaction,
			);
		});
	});

	describe('findByRefreshToken', () => {
		const mockAudit = {
			uid: 'audit-1',
			uidUser: 'abc-123',
			refreshToken: 'refresh-token',
			dataToken: ['ip-1', 'user-agent'],
		};

		it('debe retornar AuthAuditData cuando existe', async () => {
			mockFindOneAuditUseCase.execute.mockResolvedValue(mockAudit);

			const result = await adapter.findByRefreshToken('refresh-token');

			expect(mockFindOneAuditUseCase.execute).toHaveBeenCalledWith({ refreshToken: 'refresh-token' });
			expect(result).toEqual({
				uid: 'audit-1',
				uidUser: 'abc-123',
				refreshToken: 'refresh-token',
				dataToken: ['ip-1', 'user-agent'],
			});
		});

		it('debe pasar dataToken cuando se provee', async () => {
			mockFindOneAuditUseCase.execute.mockResolvedValue(mockAudit);

			await adapter.findByRefreshToken('refresh-token', ['ip-1', 'user-agent']);

			expect(mockFindOneAuditUseCase.execute).toHaveBeenCalledWith({
				refreshToken: 'refresh-token',
				dataToken: ['ip-1', 'user-agent'],
			});
		});

		it('debe retornar null cuando no existe', async () => {
			mockFindOneAuditUseCase.execute.mockResolvedValue(null);

			const result = await adapter.findByRefreshToken('invalid-token');

			expect(result).toBeNull();
		});
	});

	describe('updateToken', () => {
		it('debe actualizar el token vía use case', async () => {
			await adapter.updateToken('audit-1', 'new-refresh-token');

			expect(mockUpdateAuditUseCase.execute).toHaveBeenCalledWith({
				data: { uid: 'audit-1', refreshToken: 'new-refresh-token' },
			});
		});
	});

	describe('removeByUser', () => {
		it('debe eliminar auditoría por usuario vía use case', async () => {
			await adapter.removeByUser('abc-123', 'user-logged-out');

			expect(mockRemoveAuditUseCase.execute).toHaveBeenCalledWith({ uidUser: 'abc-123' }, 'user-logged-out');
		});
	});
});
