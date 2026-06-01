import { CacheService } from '@/services/cache.service';
import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { Injectable, Logger } from '@nestjs/common';
import { RolUpdateDTO } from '../dto/rolUpdate.dto';
import { RolRepository } from '../repository/rol.repository';
import { rolMessages } from '../rol.messages';

@Injectable()
export class UpdateRolUseCase {
	private readonly logger = new Logger(UpdateRolUseCase.name);

	constructor(
		private readonly rolRepository: RolRepository,
		private readonly cacheService: CacheService,
	) {}

	async execute({ data, dataLog }: { data: RolUpdateDTO; dataLog: string }) {
		const rol = await this.rolRepository.findOne({ where: { uid: data.uid } });
		if (!rol) {
			this.logger.error(`${dataLog} - ${rolMessages.log.rolError}`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: rolMessages.findOne }),
			);
		}

		await this.rolRepository.update(rol.uid, {
			...data,
		});
		await this.cacheService.delPattern('role:pagination');

		this.logger.log(`${dataLog} - ${rolMessages.log.updateSuccess}`);

		return { msg: rolMessages.update };
	}
}
