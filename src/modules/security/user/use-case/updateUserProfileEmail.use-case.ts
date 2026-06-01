import { CacheService } from '@/services/cache.service';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { ExtendedUnauthorizedException } from '@/exceptions/extended-unauthorized.exception';
import { objectError } from '@/functions/objectError';
import { Injectable, Logger } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UserUpdateProfileEmailDTO } from '../dto/userUpdateProfileEmail.dto';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class UpdateUserProfileEmailUseCase {
	private readonly logger = new Logger(UpdateUserProfileEmailUseCase.name);
	constructor(
		private readonly userRepository: UserRepository,
		private readonly cacheService: CacheService,
	) {}

	async execute({
		data,
		uid,
		dataLog,
	}: {
		data: UserUpdateProfileEmailDTO;
		uid: string;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const { email, password } = data;
		const user = await this.userRepository.findOne({ where: { uid } });

		if (!user) {
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: userMessages.msg.findOne }),
			);
		}

		const checkPassword = await compare(password, user.password);
		if (!checkPassword) {
			this.logger.error(`${dataLog} - ${userMessages.log.passwordError}`);
			throw new ExtendedUnauthorizedException(
				objectError({ name: 'password', msg: userMessages.msg.passwordError }),
			);
		}

		await this.userRepository.update(uid, { email });
		await this.cacheService.delPattern('user:pagination');

		this.logger.log(`${dataLog} - ${userMessages.log.profileSuccess}`);

		return { msg: userMessages.msg.update };
	}
}
