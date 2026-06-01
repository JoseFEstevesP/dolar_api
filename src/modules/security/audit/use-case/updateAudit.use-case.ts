import { CacheService } from '@/services/cache.service';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { Injectable, Logger } from '@nestjs/common';
import { auditMessages } from '../audit.messages';
import { AuditUpdateDTO } from '../dto/auditUpdate.dto';
import { AuditRepository } from '../repository/audit.repository';

@Injectable()
export class UpdateAuditUseCase {
	private readonly logger = new Logger(UpdateAuditUseCase.name);

	constructor(
		private readonly auditRepository: AuditRepository,
		private readonly cacheService: CacheService,
	) {}

	async execute({ data }: { data: AuditUpdateDTO }) {
		const { uid, refreshToken } = data;
		const audit = await this.auditRepository.findOne({
			where: { uid },
		});

		if (!audit) {
			this.logger.error(auditMessages.log.findOne);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: auditMessages.findOne }),
			);
		}

		await this.auditRepository.update(uid, { refreshToken });
		await this.cacheService.delPattern('audit:pagination');

		this.logger.log(auditMessages.log.updateSuccess);

		return { msg: auditMessages.update };
	}
}
