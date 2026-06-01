import { ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';

const collectPaths = (obj: unknown, acc: string[] = [], visited = new WeakSet<object>()): string[] => {
	if (!obj || typeof obj !== 'object') return acc;
	if (visited.has(obj)) return acc;
	visited.add(obj);
	const recordObj = obj as Record<string, unknown>;
	for (const key of Object.keys(recordObj)) {
		const value = recordObj[key];
		if (key === 'path' && typeof value === 'string' && value.length > 0) {
			acc.push(value);
		} else {
			collectPaths(value, acc, visited);
		}
	}
	return acc;
};

export const handleDatabaseError = (
	error: Error,
	logger: Logger,
	context: string,
) => {
	if (error instanceof UniqueConstraintError) {
		const paths = collectPaths(error as unknown);
		const unique = Array.from(new Set(paths));
		const message = `El valor para ${unique.length > 0 ? unique.join(', ') : ''} ya está en uso.`;
		throw new ConflictException(message);
	}

	logger.error(`Error no esperado durante ${context}`, error.stack);
	throw new InternalServerErrorException(
		`Ocurrió un error inesperado durante ${context}.`,
	);
};
