import { objectError } from '@/functions/objectError';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { Injectable, Logger } from '@nestjs/common';
import { UserActivateCountDTO } from '../dto/userActivateCount.dto';
import { userMessages } from '../user.messages';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class ActivateAccountUseCase {
	private readonly logger = new Logger(ActivateAccountUseCase.name);
	constructor(private readonly userRepository: UserRepository) {}

	async execute({ code }: UserActivateCountDTO): Promise<{ msg: string }> {
		const user = await this.userRepository.findOne({
			where: { code, status: true },
		});

		if (!user) {
			this.logger.error(`system - ${userMessages.log.userError}`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'code', msg: userMessages.msg.findOne }),
			);
		}

		await this.userRepository.update(user.uid, {
			code: undefined,
			activatedAccount: true,
		});

		this.logger.log(
			`${user.surnames} ${user.names} - ${userMessages.log.activatedAccountSuccess}`,
		);

		return { msg: userMessages.msg.activationAccount };
	}
}
