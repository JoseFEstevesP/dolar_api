import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { Injectable, Logger } from '@nestjs/common';
import { FindAttributeOptions, Includeable } from 'sequelize';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class GetUserProfileUseCase {
	private readonly logger = new Logger(GetUserProfileUseCase.name);
	constructor(private readonly userRepository: UserRepository) {}

	async execute({
		uid,
		status = true,
		dataLog,
	}: {
		uid: string;
		status?: boolean;
		dataLog: string;
	}): Promise<User> {
		const attributes: FindAttributeOptions = [
			'names',
			'surnames',
			'phone',
			'email',
		];

		const includeOptions: Includeable[] = [
			{
				model: Role,
				required: true,
				attributes: ['name', 'permissions'],
			},
		];

		const user = await this.userRepository.findOne({
			where: { uid, status },
			attributes,
			include: includeOptions,
		});

		if (!user) {
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: userMessages.msg.findOne }),
			);
		}

		this.logger.log(`${dataLog} - ${userMessages.log.profileSuccess}`);

		return user;
	}
}
