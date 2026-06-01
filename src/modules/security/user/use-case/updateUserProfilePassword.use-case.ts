import { EnvironmentVariables } from '@/config/env.config';
import { CacheService } from '@/services/cache.service';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { ExtendedUnauthorizedException } from '@/exceptions/extended-unauthorized.exception';
import { objectError } from '@/functions/objectError';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { RemoveAuditUseCase } from '../../audit/use-case/removeAudit.use-case';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class UpdateUserProfilePasswordUseCase {
	private readonly logger = new Logger(UpdateUserProfilePasswordUseCase.name);
	constructor(
		private readonly userRepository: UserRepository,
		private readonly removeAuditUseCase: RemoveAuditUseCase,
		private readonly configService: ConfigService<EnvironmentVariables>,
		private readonly cacheService: CacheService,
	) {}

	async execute({
		data,
		uid,
		dataLog,
	}: {
		data: { olPassword: string; newPassword: string };
		uid: string;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const { olPassword, newPassword } = data;
		const user = await this.userRepository.findOne({ where: { uid } });
		if (!user) {
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: userMessages.msg.findOne }),
			);
		}

		const checkPassword = await compare(olPassword, user.password);
		if (!checkPassword) {
			this.logger.error(`${dataLog} - ${userMessages.log.passwordError}`);
			throw new ExtendedUnauthorizedException(
				objectError({
					name: 'olPassword',
					msg: userMessages.msg.passwordError,
				}),
			);
		}

		const hashPass = await hash(
			newPassword,
			this.configService.get<number>('SALT_ROUNDS', { infer: true }) ?? 10,
		);
		await this.userRepository.update(uid, { password: await hashPass });
		await this.removeAuditUseCase.execute({ uidUser: uid }, dataLog);
		await this.cacheService.delPattern('user:pagination');

		this.logger.log(`${dataLog} - ${userMessages.log.profileSuccess}`);

		return { msg: userMessages.msg.update };
	}
}
