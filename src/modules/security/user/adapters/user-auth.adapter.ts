import { AuthUserData, AuthUserGateway } from '@/modules/security/auth/ports/auth-user.gateway';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { UserRepository } from '../repository/user.repository';
import { FindUserForAuthUseCase } from '../use-case/findUserById.use-case';
import { ValidateAttemptUseCase } from '../use-case/validateAttempt.use-case';

@Injectable()
export class UserAuthAdapter extends AuthUserGateway {
	constructor(
		private readonly findUserForAuthUseCase: FindUserForAuthUseCase,
		private readonly validateAttemptUseCase: ValidateAttemptUseCase,
		private readonly userRepository: UserRepository,
	) {
		super();
	}

	async findByEmail(email: string): Promise<AuthUserData | null> {
		const user = await this.findUserForAuthUseCase.execute(email);
		if (!user) return null;

		return this.toAuthData(user);
	}

	async findById(uid: string): Promise<AuthUserData | null> {
		const user = await this.userRepository.findOne({
			where: { uid },
			include: [{ model: Role, attributes: ['name', 'permissions'] }],
		});
		if (!user) return null;

		return this.toAuthData(user);
	}

	async validateAttempts(uidUser: string): Promise<void> {
		const user = await this.userRepository.findOne({ where: { uid: uidUser } });
		if (!user) return;

		await this.validateAttemptUseCase.execute({ user });
	}

	async resetAttempts(uidUser: string, transaction?: Transaction): Promise<void> {
		await this.userRepository.update(uidUser, { attemptCount: 0 }, transaction);
	}

	async beginTransaction<T>(callback: (t: Transaction) => Promise<T>): Promise<T> {
		return this.userRepository.transaction(callback);
	}

	private toAuthData(user: {
		uid: string;
		password: string | null;
		attemptCount: number;
		status: boolean;
		activatedAccount: boolean;
		uidRol: string;
		surnames: string;
		names: string;
		email: string;
		provider: string;
		rol?: Role;
	}): AuthUserData {
		return {
			uid: user.uid,
			password: user.password,
			attemptCount: user.attemptCount,
			status: user.status,
			activatedAccount: user.activatedAccount,
			uidRol: user.uidRol,
			surnames: user.surnames,
			names: user.names,
			email: user.email,
			provider: user.provider,
			rol: user.rol
				? { name: user.rol.name, permissions: user.rol.permissions }
				: undefined,
		};
	}
}
