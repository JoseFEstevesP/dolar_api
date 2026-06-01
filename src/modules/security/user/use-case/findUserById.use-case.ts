import { Injectable } from '@nestjs/common';
import { Includeable } from 'sequelize';
import { User } from '../entities/user.entity';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class FindUserForAuthUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(email: string): Promise<User | null> {
		const includeOptions: Includeable[] = [
			{
				model: Role,
				attributes: ['name', 'permissions'],
			},
		];

		const user = await this.userRepository.findOne({
			where: { email },
			include: includeOptions,
		});

		return user;
	}
}
