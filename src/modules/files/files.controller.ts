import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Logger,
	Post,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { filesMessages } from './files.messages';
import { DeleteFileUseCase } from './use-case/deleteFile.use-case';
import { SaveFileUseCase } from './use-case/saveFile.use-case';

@Controller('files')
export class FilesController {
	private readonly logger = new Logger(FilesController.name);

	constructor(
		private readonly saveFileUseCase: SaveFileUseCase,
		private readonly deleteFileUseCase: DeleteFileUseCase,
	) {}

	@Post('upload')
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(
		@UploadedFile() file: Express.Multer.File,
		@Body('type') type: 'image' | 'document',
	) {
		this.logger.log(filesMessages.log.uploadingFile);
		if (!file) {
			throw new BadRequestException(filesMessages.fileRequired);
		}
		if (!type) {
			throw new BadRequestException(filesMessages.typeRequired);
		}
		const filename = await this.saveFileUseCase.execute(file, type);
		this.logger.log(filesMessages.log.fileUploadSuccess);
		return { filename, message: filesMessages.fileUploaded };
	}

	@Delete('delete')
	async deleteFile(
		@Query('filename') filename: string,
		@Query('type') type: 'image' | 'document',
	) {
		this.logger.log(filesMessages.log.deletingFile);
		if (!filename) {
			throw new BadRequestException(filesMessages.filenameRequired);
		}
		if (!type) {
			throw new BadRequestException(filesMessages.typeRequired);
		}
		await this.deleteFileUseCase.execute(filename, type);
		this.logger.log(filesMessages.log.fileDeleteSuccess);
		return { deleted: true, message: filesMessages.fileDeleted };
	}
}
