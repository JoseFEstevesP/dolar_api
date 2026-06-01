import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { CacheService } from '@/services/cache.service';
import { LoggerService } from '@/services/logger.service';
import { Injectable } from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { Role } from '../entities/rol.entity';
import { RolRepository } from '../repository/rol.repository';
import { rolMessages } from '../rol.messages';

@Injectable()
export class FindOneRolUseCase {
	private readonly CACHE_TTL = 3600000;

	constructor(
		private readonly rolRepository: RolRepository,
		private readonly cacheService: CacheService,
		private readonly logger: LoggerService,
	) {}

	async execute(where: WhereOptions<Role>, dataLog?: string) {
		const uid = (where as { uid?: string }).uid;
		if (!uid) {
			return this.fetchAndCache(where, dataLog);
		}

		const cacheKey = this.cacheService.buildRoleKey(uid);
		const cached = await this.cacheService.get<Role>(cacheKey);
		if (cached) {
			this.logger.debug(`Retornando rol desde caché: ${cacheKey}`, {
				type: 'role_find_one',
				fromCache: true,
			});
			return cached;
		}

		return this.fetchAndCache(where, dataLog, cacheKey);
	}

	private async fetchAndCache(
		where: WhereOptions<Role>,
		dataLog?: string,
		cacheKey?: string,
	): Promise<Role> {
		const rol = await this.rolRepository.findOne({
			where: { ...where },
			attributes: {
				exclude: ['createdAt', 'updatedAt'],
			},
		});

		if (!rol) {
			this.logger.error(
				`${dataLog ? dataLog : 'system'} - ${rolMessages.log.findOne}`,
				'FindOneRolUseCase',
				{
					type: 'role_find_one',
					status: 'not_found',
				},
			);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: rolMessages.findOne }),
			);
		}

		if (cacheKey) {
			await this.cacheService.set(cacheKey, rol, this.CACHE_TTL);
		}

		this.logger.info(
			`${dataLog ? dataLog : 'system'} - ${rolMessages.log.findOneSuccess}`,
			{
				type: 'role_find_one',
				roleId: rol.uid,
				fromCache: false,
			},
		);

		return rol;
	}
}
