import { handleDatabaseError } from '@/functions/handleDatabaseError';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
	FindAndCountOptions,
	FindAttributeOptions,
	Includeable,
	Transaction,
	WhereOptions,
} from 'sequelize';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
	private readonly logger = new Logger(UserRepository.name);

	constructor(
		@InjectModel(User)
		private readonly userModel: typeof User,
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
	) {}

	private async invalidateCache(): Promise<void> {
		try {
			const cache = this.cacheManager as unknown as {
				reset: () => Promise<void>;
			};
			if (typeof cache.reset === 'function') {
				await cache.reset();
			}
			this.logger.log('Cache invalidated successfully');
		} catch (error) {
			this.logger.warn('Failed to invalidate cache', error);
		}
	}

	async create(user: User): Promise<User> {
		try {
			const result = await this.userModel.create(user);
			await this.invalidateCache();
			return result;
		} catch (error) {
			handleDatabaseError(
				error as Error,
				this.logger,
				'la creación del usuario',
			);
			throw error;
		}
	}

	async findOne({
		where,
		attributes,
		include,
		useCache = true,
	}: {
		where: WhereOptions<User>;
		attributes?: FindAttributeOptions;
		include?: Includeable[];
		useCache?: boolean;
	}): Promise<User | null> {
		if (useCache) {
			const cacheKey = `User-findOne:${JSON.stringify({ where, attributes, include })}`;
			const cachedData = await this.cacheManager.get<User | null>(cacheKey);
			if (cachedData) {
				return cachedData;
			}

			const user = await this.userModel.findOne({
				where,
				...(attributes && { attributes }),
				...(include && { include }),
			});

			if (user) {
				await this.cacheManager.set(cacheKey, user, 1000 * 60);
			}

			return user;
		}

		return this.userModel.findOne({
			where,
			...(attributes && { attributes }),
			...(include && { include }),
		});
	}

	async findAll(): Promise<User[]> {
		const cacheKey = `User-findAll`;
		const cachedData = await this.cacheManager.get<User[]>(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		const users = await this.userModel.findAll();
		await this.cacheManager.set(cacheKey, users, 1000 * 60);

		return users;
	}

	async findAndCountAll(options: FindAndCountOptions<User>) {
		// Caché desactivado: los Símbolos de Sequelize no se serializan en JSON
		return this.userModel.findAndCountAll(options);
	}

	async update(
		uid: string,
		user: Partial<User>,
		transaction?: Transaction,
	): Promise<User | null> {
		try {
			const [affectedCount] = await this.userModel.update(user, {
				where: { uid },
				...(transaction && { transaction }),
			});
			if (affectedCount === 0) {
				return null;
			}
			await this.invalidateCache();
			return this.findOne({ where: { uid } });
		} catch (error) {
			handleDatabaseError(
				error as Error,
				this.logger,
				'la actualización del usuario',
			);
			return null;
		}
	}

	async delete(uid: string): Promise<boolean> {
		try {
			const deletedCount = await this.userModel.destroy({
				where: { uid },
			});
			if (deletedCount > 0) {
				await this.invalidateCache();
			}
			return deletedCount > 0;
		} catch (error) {
			handleDatabaseError(
				error as Error,
				this.logger,
				'la eliminación del usuario',
			);
			return false;
		}
	}

	async transaction<T>(callback: (t: Transaction) => Promise<T>): Promise<T> {
		const sequelize = this.userModel.sequelize;
		if (!sequelize) {
			throw new Error('Sequelize instance not available');
		}
		return await sequelize.transaction(callback);
	}

	async findAllWithOptions<T>(options: FindAndCountOptions<User>): Promise<T[]> {
		const result = await this.userModel.findAll(options);
		return result as unknown as T[];
	}

	async count(options: { where?: WhereOptions<User> }): Promise<number> {
		return this.userModel.count(options);
	}
}
