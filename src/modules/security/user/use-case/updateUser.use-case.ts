import { CacheService } from '@/services/cache.service';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { LoggerService } from '@/services/logger.service';
import { Injectable } from '@nestjs/common';
import { UserUpdateDTO } from '../dto/userUpdate.dto';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class UpdateUserUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly logger: LoggerService,
		private readonly cacheService: CacheService,
	) {}

	async execute({
		data,
		dataLog,
	}: {
		data: UserUpdateDTO;
		dataLog: string;
	}): Promise<{ msg: string }> {
		const { uid, ...updatedData } = data;

		this.logger.debug(`Actualizando usuario: ${uid}`, {
			type: 'user_update',
			userId: uid,
		});

		const user = await this.userRepository.findOne({ where: { uid } });

		if (!user) {
			this.logger.error(
				`${dataLog} - ${userMessages.log.userError}`,
				'UpdateUserUseCase',
				{
					type: 'user_update',
					userId: uid,
					status: 'not_found',
				},
			);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: userMessages.msg.findOne }),
			);
		}

		await this.userRepository.update(uid, {
			...updatedData,
			...(updatedData.activatedAccount === true ? { code: undefined } : {}),
		});
		await this.cacheService.delPattern('user:pagination');

		this.logger.info(`${dataLog} - ${userMessages.log.updateSuccess}`, {
			type: 'user_update',
			userId: uid,
			status: 'success',
		});

		this.logger.logMetric('usuario.actualizado', 1, { userId: uid });

		return { msg: userMessages.msg.update };
	}
}
