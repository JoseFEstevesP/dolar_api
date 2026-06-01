import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class FindUserByIdUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(uid: string): Promise<User | null> {
		const user = await this.userRepository.findOne({ where: { uid } });
		return user;
	}
}
