import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Includeable } from 'sequelize';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class FindOneUserByUidUseCase {
	private readonly logger = new Logger(FindOneUserByUidUseCase.name);

	constructor(private readonly userRepository: UserRepository) {}

	async execute(uid: string, dataLog?: string): Promise<User> {
		const user = await this.userRepository.findOne({
			where: { uid },
			attributes: {
				exclude: ['password', 'createdAt', 'updatedAt'],
			},
			include: this.getIncludeOptions(),
			useCache: false,
		});

		if (!user) {
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: userMessages.msg.findOne }),
			);
		}

		this.logger.log(`${dataLog} - ${userMessages.log.findOneSuccess}`);

		return user;
	}

	private getIncludeOptions(): Includeable[] {
		return [
			{
				model: Role,
				required: true,
				attributes: ['name', 'permissions'],
			},
		];
	}
}
