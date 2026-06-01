import { ExtendedNotFoundException } from '@/exceptions/extended-not-found.exception';
import { objectError } from '@/functions/objectError';
import { Injectable, Logger } from '@nestjs/common';
import { RolRepository } from '../repository/rol.repository';
import { rolMessages } from '../rol.messages';

@Injectable()
export class FindRolPermissionsUseCase {
	private readonly logger = new Logger(FindRolPermissionsUseCase.name);

	constructor(private readonly rolRepository: RolRepository) {}
	async execute({ uid, dataLog }: { uid: string; dataLog: string }) {
		const rol = await this.rolRepository.findOne({
			where: {
				uid,
				status: true,
			},
			attributes: ['uid', 'name', 'permissions'],
		});

		if (!rol) {
			this.logger.error(`${dataLog} - ${rolMessages.log.rolError}`);
			throw new ExtendedNotFoundException(
				objectError({ name: 'all', msg: rolMessages.findOne }),
			);
		}

		this.logger.log(`${dataLog} - ${rolMessages.log.findOneSuccess}`);

		return rol;
	}
}
