import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { userMessages } from '../user.messages';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class ValidateAttemptUseCase {
	private readonly logger = new Logger(ValidateAttemptUseCase.name);
	constructor(private readonly userRepository: UserRepository) {}

	async execute({
		user,
		maxAttempt = 4,
	}: {
		user: User;
		maxAttempt?: number;
	}): Promise<void> {
		if (user?.attemptCount < maxAttempt) {
			await this.userRepository.update(user.uid, {
				attemptCount:
					user?.attemptCount >= maxAttempt
						? maxAttempt
						: user?.attemptCount + 1,
			});
		}

		if (user?.attemptCount >= maxAttempt) {
			this.logger.error(userMessages.log.attempt);
			await this.userRepository.update(user.uid, {
				attemptCount: maxAttempt,
				status: false,
			});
			throw new ForbiddenException(userMessages.msg.attempt);
		}
	}
}
