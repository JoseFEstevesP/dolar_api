import { CacheService } from '@/services/cache.service';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { Injectable, Logger } from '@nestjs/common';
import { UserUpdateProfileDataDTO } from '../dto/userUpdateProfileData.dto';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class UpdateUserProfileUseCase {
	private readonly logger = new Logger(UpdateUserProfileUseCase.name);
	constructor(
		private readonly userRepository: UserRepository,
		private readonly cacheService: CacheService,
	) {}

	async execute({
		data,
		uid,
		dataLog,
	}: {
		data: UserUpdateProfileDataDTO;
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

		await this.userRepository.update(uid, data);
		await this.cacheService.delPattern('user:pagination');

		this.logger.log(`${dataLog} - ${userMessages.log.profileSuccess}`);

		return { msg: userMessages.msg.update };
	}
}
