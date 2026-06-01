import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuditRepository } from '../repository/audit.repository';

@Injectable()
export class CleanUpOldAuditsUseCase {
	private readonly logger = new Logger(CleanUpOldAuditsUseCase.name);
	private readonly lockKey = 'audit_cleanup_lock';
	private readonly lockTimeout = 60000;

	constructor(
		private readonly auditRepository: AuditRepository,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	private async acquireLock(): Promise<boolean> {
		const result = await this.cacheManager.set(
			this.lockKey,
			true,
			this.lockTimeout,
		);
		return result === true;
	}

	private async releaseLock(): Promise<void> {
		try {
			await this.cacheManager.del(this.lockKey);
		} catch (error) {
			this.logger.error('system - Error al liberar el lock de Redis:', error);
		}
	}

	private async removeOldAudits() {
		const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
		try {
			// Usamos el método deleteOldRecords del repositorio
			const result =
				await this.auditRepository.deleteOldRecords(twentyFourHoursAgo);
			this.logger.log(
				`system - Tarea programada: Eliminados ${result} registros de auditoría antiguos.`,
			);
		} catch (error) {
			this.logger.error(
				'system - Error al eliminar registros de auditoría antiguos:',
				error,
			);
		} finally {
			await this.releaseLock();
		}
	}

	@Cron('0 0 * * *')
	async executeScheduled() {
		this.logger.log(
			'system - Intentando adquirir el lock para limpiar auditorías...',
		);
		if (await this.acquireLock()) {
			this.logger.log(
				'system - Lock adquirido, ejecutando la limpieza de auditorías...',
			);
			await this.removeOldAudits();
			this.logger.log(
				'system - Limpieza de auditorías completada, liberando el lock.',
			);
		} else {
			this.logger.log(
				'system - No se pudo adquirir el lock, otra instancia probablemente está ejecutando la tarea.',
			);
		}
	}
}
