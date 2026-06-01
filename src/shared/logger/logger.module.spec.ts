import { LoggerModule } from './logger.module';

describe('LoggerModule', () => {
	it('debe estar definido', () => {
		expect(LoggerModule).toBeDefined();
	});

	it('debe tener providers y exports metadata', () => {
		const providers = Reflect.getMetadata('providers', LoggerModule) || [];
		const exports = Reflect.getMetadata('exports', LoggerModule) || [];
		const providerNames = providers.map((e: any) => e.name || e);
		const exportNames = exports.map((e: any) => e.name || e);
		expect(providerNames).toContain('LoggerService');
		expect(exportNames).toContain('LoggerService');
	});
});
