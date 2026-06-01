import {
	Injectable,
	Logger,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { filesMessages } from '../files.messages';

@Injectable()
export class DeleteFileUseCase {
	private readonly logger = new Logger(DeleteFileUseCase.name);
	private readonly imagesDir = path.join(process.cwd(), 'uploads/images');
	private readonly documentsDir = path.join(process.cwd(), 'uploads/documents');

	constructor() {
		if (!fs.existsSync(this.imagesDir)) {
			fs.mkdirSync(this.imagesDir, { recursive: true });
		}
		if (!fs.existsSync(this.documentsDir)) {
			fs.mkdirSync(this.documentsDir, { recursive: true });
		}
	}

	async execute(filename: string, type: 'image' | 'document'): Promise<void> {
		if (!filename) {
			throw new BadRequestException(filesMessages.filenameRequired);
		}
		if (!type) {
			throw new BadRequestException(filesMessages.typeRequired);
		}

		const dir = type === 'image' ? this.imagesDir : this.documentsDir;
		const filePath = path.join(dir, filename);

		try {
			if (fs.existsSync(filePath)) {
				await fs.promises.unlink(filePath);
				this.logger.log(`File deleted: ${filename}`);
			} else {
				this.logger.warn(`File not found: ${filename}`);
				throw new NotFoundException(filesMessages.fileNotFound);
			}
		} catch (error) {
			const err = error as Error;
			this.logger.error(`Error deleting file ${filename}: ${err.message}`);
			throw new BadRequestException(`Failed to delete file: ${err.message}`);
		}
	}
}
