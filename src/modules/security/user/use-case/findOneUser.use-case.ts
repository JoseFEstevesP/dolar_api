import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Includeable, WhereOptions } from 'sequelize';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class FindOneUserUseCase {
	private readonly logger = new Logger(FindOneUserUseCase.name);

	constructor(private readonly userRepository: UserRepository) {}

	async execute(where: WhereOptions<User>, dataLog?: string): Promise<User> {
		const user = await this.userRepository.findOne({
			where: { ...where },
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

		const isAdmin = user.rol.permissions.includes('user.delete');
		if (!isAdmin) {
			this.logger.error(`${dataLog} - ${userMessages.log.userError}`);
			throw new ForbiddenException(userMessages.msg.userType);
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
