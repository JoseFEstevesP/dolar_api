import { CacheService } from '@/services/cache.service';
import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { LoggerService } from '@/services/logger.service';
import { AuditRegisterDTO } from '../dto/auditRegister.dto';
import { Audit } from '../entities/audit.entity';
import { auditMessages } from '../audit.messages';
import { AuditRepository } from '../repository/audit.repository';

@Injectable()
export class CreateAuditUseCase {
	constructor(
		private readonly auditRepository: AuditRepository,
		private readonly logger: LoggerService,
		private readonly cacheService: CacheService,
	) {}

	async execute(
		{ data }: { data: AuditRegisterDTO },
		t?: Transaction,
	): Promise<Audit> {
		this.logger.debug('Creando registro de auditoría', {
			type: 'audit_create',
			userId: data.uidUser,
		});

		const audit = await this.auditRepository.findOne({
			where: {
				uidUser: data.uidUser,
				dataToken: data.dataToken,
			},
		});

		let created: Audit;

		if (audit) {
			this.logger.info('Auditoría ya existe, actualizando', {
				type: 'audit_create',
				userId: data.uidUser,
				auditId: audit.uid,
				status: 'updated',
			});
			await this.auditRepository.update(
				audit.uid,
				{ refreshToken: data.refreshToken },
				t,
			);
			created = audit;
		} else {
			created = await this.auditRepository.create(data, t);
		}
		await this.cacheService.delPattern('audit:pagination');

		this.logger.info(auditMessages.log.createSuccess, {
			type: 'audit_create',
			auditId: created.uid,
			userId: data.uidUser,
		});

		return created;
	}
}
