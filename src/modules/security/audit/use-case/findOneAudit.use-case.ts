import { Injectable, Logger } from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { Audit } from '../entities/audit.entity';
import { auditMessages } from '../audit.messages';
import { AuditRepository } from '../repository/audit.repository';

@Injectable()
export class FindOneAuditUseCase {
	private readonly logger = new Logger(FindOneAuditUseCase.name);

	constructor(private readonly auditRepository: AuditRepository) {}

	async execute(where: WhereOptions<Audit>) {
		this.logger.log(auditMessages.log.controller.getOne);

		return await this.auditRepository.findOne({ where });
	}
}
