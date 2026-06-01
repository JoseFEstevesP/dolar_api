import { objectError } from '@/functions/objectError';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { ExtendedBadRequestException } from '@/exceptions/extended-bad-request.exception';
import { EmailService } from '@/services/email.service';
import { Injectable, Logger } from '@nestjs/common';
import { userMessages } from '../user.messages';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class RecoveryPasswordUseCase {
	private readonly logger = new Logger(RecoveryPasswordUseCase.name);
	constructor(
		private readonly userRepository: UserRepository,
		private readonly emailService: EmailService,
	) {}

	async execute({ email }: { email: string }): Promise<{ msg: string }> {
		const user = await this.userRepository.findOne({
			where: { email, status: true },
		});

		if (!user) {
			this.logger.error(`system - ${userMessages.log.userError}`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'email', msg: userMessages.msg.findOne }),
			);
		}

		if (!user.activatedAccount) {
			this.logger.error(`system - ${userMessages.log.userErrorActiveAccount}`);
			throw new ExtendedBadRequestException(
				objectError({ name: 'email', msg: userMessages.msg.findOne }),
			);
		}

		const generateCode = () => Math.floor(Math.random() * 9000000) + 1000000;
		const code = generateCode().toString();

		await this.userRepository.update(user.uid, { code });

		this.emailService.recoveryPassword({
			code,
			email,
		});

		this.logger.log(`system - ${userMessages.log.recoveryPasswordSuccess}`);

		return { msg: userMessages.msg.recoveryPassword };
	}
}
