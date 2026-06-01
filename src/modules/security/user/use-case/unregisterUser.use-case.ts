import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class UnregisterUserUseCase {
	private readonly logger = new Logger(UnregisterUserUseCase.name);
	constructor(private readonly userRepository: UserRepository) {}

	async execute({
		uid,
		dataLog,
	}: {
		uid: string;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const user = await this.userRepository.findOne({ where: { uid } });

		if (!user) {
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: userMessages.msg.findOne }),
			);
		}

		await this.userRepository.update(uid, { status: false });

		this.logger.log(`${dataLog} - ${userMessages.log.unregisterSuccess}`);

		return { msg: userMessages.msg.unregister };
	}
}
