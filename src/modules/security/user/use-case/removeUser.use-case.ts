import { CacheService } from '@/services/cache.service';
import { ExtendedConflictException } from '@/exceptions/extended-conflict.exception';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { LoggerService } from '@/services/logger.service';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { userMessages } from '../user.messages';

@Injectable()
export class RemoveUserUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly logger: LoggerService,
		private readonly cacheService: CacheService,
	) {}

	async execute({
		uid,
		dataLog,
	}: {
		uid: string;
		dataLog: string;
	}): Promise<{ msg: string }> {
		this.logger.debug(`Eliminando usuario: ${uid}`, {
			type: 'user_remove',
			userId: uid,
		});

		const user = await this.userRepository.findOne({
			where: { uid, status: true },
		});

		if (!user) {
			this.logger.error(
				`${dataLog} - ${userMessages.log.userError}`,
				'RemoveUserUseCase',
				{
					type: 'user_remove',
					userId: uid,
					status: 'not_found',
				},
			);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: userMessages.msg.findOne }),
			);
		}

		try {
			await this.userRepository.delete(uid);
			await this.cacheService.delPattern('user:pagination');

			this.logger.info(`${dataLog} - ${userMessages.log.unregisterSuccess}`, {
				type: 'user_remove',
				userId: uid,
				status: 'success',
			});

			this.logger.logMetric('usuario.eliminado', 1, { userId: uid });

			return { msg: userMessages.msg.unregister };
		} catch (err) {
			this.logger.error(
				`${dataLog} - ${userMessages.log.relationError}`,
				'RemoveUserUseCase',
				{
					type: 'user_remove',
					userId: uid,
					error: err instanceof Error ? err.message : 'Unknown error',
				},
			);
			throw new ExtendedConflictException(
				objectError({ name: 'all', msg: userMessages.log.relationError }),
			);
		}
	}
}
