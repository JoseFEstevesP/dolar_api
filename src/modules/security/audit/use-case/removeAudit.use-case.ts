import { CacheService } from '@/services/cache.service';
import { ExtendedConflictException } from '@/exceptions/extended-conflict.exception';
import { objectError } from '@/functions/objectError';
import { Audit } from '@/modules/security/audit/entities/audit.entity';
import { Injectable, Logger } from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { auditMessages } from '../audit.messages';
import { AuditRepository } from '../repository/audit.repository';

@Injectable()
export class RemoveAuditUseCase {
	private readonly logger = new Logger(RemoveAuditUseCase.name);

	constructor(
		private readonly auditRepository: AuditRepository,
		private readonly cacheService: CacheService,
	) {}

	async execute(where: WhereOptions<Audit>, dataLog: string) {
		const audit = await this.auditRepository.findOne({ where });

		if (!audit) {
			this.logger.warn(
				`${dataLog} - Registro de auditoría no encontrado para logout`,
			);
			return { msg: 'Sesión cerrada' };
		}

		try {
			await this.auditRepository.remove(audit.uid);
			await this.cacheService.delPattern('audit:pagination');
			this.logger.log(`${dataLog} - ${auditMessages.log.remove}`);
			return { msg: auditMessages.remove };
		} catch (err) {
			if (err) {
				this.logger.error(`${dataLog} - ${auditMessages.log.relationError}`);
				throw new ExtendedConflictException(
					objectError({ name: 'all', msg: auditMessages.log.relationError }),
				);
			}
		}
	}
}
