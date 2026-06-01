import { objectError } from '@/functions/objectError';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@/services/jwt.service';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class RecoveryVerifyPasswordUseCase {
	private readonly logger = new Logger(RecoveryVerifyPasswordUseCase.name);
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	async execute({
		code,
		email,
	}: {
		code: string;
		email: string;
	}): Promise<{ token: string }> {
		const user = await this.userRepository.findOne({
			where: { email, code, status: true },
		});

		if (!user) {
			this.logger.error(`system - ${userMessages.log.userError}`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'code', msg: userMessages.msg.findOne }),
			);
		}

		await this.userRepository.update(user.uid, {
			code: undefined,
		});

		const token = await this.jwtService.signAsync(
			{
				uid: user.uid,
				dataLog: `${user.surnames} ${user.names}`,
			},
			{
				expiresIn: '10m',
				secret: this.configService.get('JWT_SECRET'),
			},
		);

		this.logger.log(`system - ${userMessages.log.newPasswordSuccess}`);

		return { token };
	}
}
