import { Injectable } from '@nestjs/common';
import { CacheService } from '@/services/cache.service';
import { LoggerService } from '@/services/logger.service';
import { rolMessages } from '../rol.messages';
import { RolRepository } from '../repository/rol.repository';

@Injectable()
export class FindAllRolsUseCase {
	private readonly CACHE_TTL = 3600000;

	constructor(
		private readonly rolRepository: RolRepository,
		private readonly cacheService: CacheService,
		private readonly logger: LoggerService,
	) {}

	async execute({ dataLog }: { dataLog: string }) {
		const cacheKey = this.cacheService.buildRoleListKey();

		const cached =
			await this.cacheService.get<{ value: string; label: string }[]>(cacheKey);
		if (cached) {
			this.logger.debug(`Retornando roles desde caché: ${cacheKey}`, {
				type: 'role_find_all',
				fromCache: true,
			});
			return cached;
		}

		const rol = await this.rolRepository.findAll({
			where: { status: true },
			attributes: ['uid', 'name'],
		});

		const formatterData = rol.map(item => ({
			value: item.uid,
			label: item.name,
		}));

		await this.cacheService.set(cacheKey, formatterData, this.CACHE_TTL);

		this.logger.info(`${dataLog} - ${rolMessages.log.findAllSuccess}`, {
			type: 'role_find_all',
			count: formatterData.length,
			fromCache: false,
		});

		this.logger.logMetric('rol.buscar_todos', formatterData.length);

		return formatterData;
	}
}
