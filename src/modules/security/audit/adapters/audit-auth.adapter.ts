import { AuthAuditData, AuthAuditGateway } from '@/modules/security/auth/ports/auth-audit.gateway';
import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { AuditRepository } from '../repository/audit.repository';
import { CreateAuditUseCase } from '../use-case/createAudit.use-case';
import { FindOneAuditUseCase } from '../use-case/findOneAudit.use-case';
import { RemoveAuditUseCase } from '../use-case/removeAudit.use-case';
import { UpdateAuditUseCase } from '../use-case/updateAudit.use-case';

@Injectable()
export class AuditAuthAdapter extends AuthAuditGateway {
	constructor(
		private readonly createAuditUseCase: CreateAuditUseCase,
		private readonly findOneAuditUseCase: FindOneAuditUseCase,
		private readonly updateAuditUseCase: UpdateAuditUseCase,
		private readonly removeAuditUseCase: RemoveAuditUseCase,
		private readonly auditRepository: AuditRepository,
	) {
		super();
	}

	async create(uidUser: string, refreshToken: string, dataToken: string[], transaction?: Transaction): Promise<void> {
		await this.createAuditUseCase.execute(
			{ data: { uidUser, refreshToken, dataToken } },
			transaction,
		);
	}

	async findByRefreshToken(refreshToken: string, dataToken?: string[]): Promise<AuthAuditData | null> {
		const where = dataToken ? { refreshToken, dataToken } : { refreshToken };
		const audit = await this.findOneAuditUseCase.execute(where);
		if (!audit) return null;

		return {
			uid: audit.uid,
			uidUser: audit.uidUser,
			refreshToken: audit.refreshToken,
			dataToken: audit.dataToken,
		};
	}

	async updateToken(uid: string, refreshToken: string): Promise<void> {
		await this.updateAuditUseCase.execute({ data: { uid, refreshToken } });
	}

	async removeByUser(uidUser: string, dataLog: string): Promise<void> {
		await this.removeAuditUseCase.execute({ uidUser }, dataLog);
	}
}
