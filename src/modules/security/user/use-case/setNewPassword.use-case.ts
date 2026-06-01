import { EnvironmentVariables } from '@/config/env.config';
import { ExtendedBadRequestException } from '@/exceptions/extended-bad-request.exception';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class SetNewPasswordUseCase {
	private readonly logger = new Logger(SetNewPasswordUseCase.name);
	constructor(
		private readonly userRepository: UserRepository,
		private readonly configService: ConfigService<EnvironmentVariables>,
	) {}

	async execute({
		newPassword,
		confirmPassword,
		uidUser,
		dataLog,
	}: {
		newPassword: string;
		confirmPassword: string;
		uidUser: string;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const user = await this.userRepository.findOne({
			where: { uid: uidUser, code: undefined, status: true },
		});

		if (!user) {
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: userMessages.msg.findOne }),
			);
		}

		if (newPassword !== confirmPassword) {
			this.logger.error(
				`${dataLog} - ${userMessages.log.userErrorNewPassword}`,
			);
			throw new ExtendedBadRequestException(
				objectError({
					name: 'confirmPassword',
					msg: userMessages.msg.newPassword,
				}),
			);
		}

		const hashPass = await hash(
			newPassword,
			this.configService.get<number>('SALT_ROUNDS', { infer: true }) ?? 10,
		);

		await this.userRepository.update(uidUser, {
			password: await hashPass,
		});

		this.logger.log(
			`${dataLog} - ${userMessages.log.recoveryVerifyPasswordSuccess}`,
		);

		return { msg: userMessages.msg.newPasswordChanged };
	}
}
