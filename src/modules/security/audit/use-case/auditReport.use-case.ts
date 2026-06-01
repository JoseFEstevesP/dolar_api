import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Audit } from '../entities/audit.entity';

@Injectable()
export class AuditReportUseCase {
	constructor(
		@InjectModel(Audit) private readonly auditModel: typeof Audit,
	) {}

	async countDistinctUsers() {
		return this.auditModel.count({
			distinct: true,
			col: 'uidUser',
		});
	}
}
