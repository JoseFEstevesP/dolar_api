import { handleDatabaseError } from '@/functions/handleDatabaseError';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
	FindAndCountOptions,
	FindAttributeOptions,
	Includeable,
	WhereOptions,
} from 'sequelize';
import { Role } from '../entities/rol.entity';

@Injectable()
export class RolRepository {
	private readonly logger = new Logger(RolRepository.name);

	constructor(
		@InjectModel(Role) private readonly rolModel: typeof Role,
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
	) {}

	private async invalidateCache(uid?: string): Promise<void> {
		try {
			this.logger.log(`Invalidating cache for role: ${uid ?? 'all'}`);

			await this.cacheManager.del('cache:role:all');

			if (uid) {
				await this.cacheManager.del(`cache:role:${uid}`);
			}

			const store = (this.cacheManager as Record<string, unknown>)
				.store as Record<string, unknown>;
			const keysFn = store?.keys as
				| ((pattern?: string) => string[])
				| undefined;
			if (typeof keysFn === 'function') {
				const allKeys = keysFn('cache:role:');
				const paginationKeys = allKeys.filter(key =>
					key.includes('pagination'),
				);
				this.logger.log(
					`Found ${paginationKeys.length} pagination cache keys to delete`,
				);
				await Promise.all(
					paginationKeys.map((key: string) => this.cacheManager.del(key)),
				);
			}
		} catch (error) {
			this.logger.warn('Failed to invalidate cache', error);
		}
	}

	async create(data: Role): Promise<Role> {
		try {
			const result = await this.rolModel.create(data);
			await this.invalidateCache(result.uid);
			return result;
		} catch (error) {
			handleDatabaseError(error as Error, this.logger, 'la creación del rol');
			throw error;
		}
	}

	async findOne({
		where,
		attributes,
		include,
	}: {
		where: WhereOptions<Role>;
		attributes?: FindAttributeOptions;
		include?: Includeable[];
	}): Promise<Role | null> {
		return this.rolModel.findOne({
			where,
			...(attributes && { attributes }),
			...(include && { include }),
		});
	}

	async findAndCountAll(
		options: FindAndCountOptions<Role>,
	): Promise<{ rows: Role[]; count: number }> {
		return this.rolModel.findAndCountAll(options);
	}

	async findAll({
		where,
		attributes,
	}: {
		where: WhereOptions<Role>;
		attributes?: FindAttributeOptions;
	}): Promise<Role[]> {
		return this.rolModel.findAll({
			where,
			...(attributes && { attributes }),
		});
	}

	async update(uid: string, data: Partial<Role>): Promise<void> {
		try {
			await this.rolModel.update(data, { where: { uid } });
			await this.invalidateCache(uid);
		} catch (error) {
			handleDatabaseError(
				error as Error,
				this.logger,
				'la actualización del rol',
			);
		}
	}

	async remove(uid: string): Promise<void> {
		try {
			await this.rolModel.destroy({ where: { uid } });
			await this.invalidateCache(uid);
		} catch (error) {
			handleDatabaseError(
				error as Error,
				this.logger,
				'la eliminación del rol',
			);
		}
	}
}
