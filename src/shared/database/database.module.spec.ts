import { DatabaseModule } from './database.module';

describe('DatabaseModule', () => {
	it('debe estar definido', () => {
		expect(DatabaseModule).toBeDefined();
	});

	it('debe tener metadata de módulo NestJS', () => {
		const metadata = Reflect.getMetadataKeys(DatabaseModule);
		expect(metadata).toContain('imports');
		expect(metadata).toContain('providers');
		expect(metadata).toContain('exports');
	});

	it('debe exportar UserRepository, RolRepository, AuditRepository', () => {
		const exports = Reflect.getMetadata('exports', DatabaseModule) || [];
		const exportNames = exports.map((e: any) => e.name || e);
		expect(exportNames).toContain('UserRepository');
		expect(exportNames).toContain('RolRepository');
		expect(exportNames).toContain('AuditRepository');
	});
});
