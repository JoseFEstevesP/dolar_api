import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { filesMessages } from '../files.messages';

@Injectable()
export class SaveFileUseCase {
	private readonly logger = new Logger(SaveFileUseCase.name);
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

	async execute(
		file: Express.Multer.File,
		type: 'image' | 'document',
	): Promise<string> {
		if (!file) {
			throw new BadRequestException(filesMessages.fileRequired);
		}

		const allowedImageMimeTypes = [
			'image/jpeg',
			'image/png',
			'image/gif',
			'image/webp',
		];
		const allowedDocumentMimeTypes = [
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		];

		let dir: string;
		if (type === 'image') {
			dir = this.imagesDir;
			if (!allowedImageMimeTypes.includes(file.mimetype)) {
				throw new BadRequestException(filesMessages.invalidFileType);
			}
		} else if (type === 'document') {
			dir = this.documentsDir;
			if (!allowedDocumentMimeTypes.includes(file.mimetype)) {
				throw new BadRequestException(filesMessages.invalidFileType);
			}
		} else {
			throw new BadRequestException(filesMessages.typeRequired);
		}

		const ext = path.extname(file.originalname);
		const filename = `${crypto.randomUUID()}${ext}`;
		const filePath = path.join(dir, filename);

		try {
			await fs.promises.writeFile(filePath, file.buffer);
			this.logger.log(`File saved: ${filename}`);
			return filename;
		} catch (error) {
			const err = error as Error;
			this.logger.error(`Error saving file ${filename}: ${err.message}`);
			throw new BadRequestException(`Failed to save file: ${err.message}`);
		}
	}
}
