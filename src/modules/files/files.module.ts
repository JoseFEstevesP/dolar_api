import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FilesController } from './files.controller';
import { SaveFileUseCase } from './use-case/saveFile.use-case';
import { DeleteFileUseCase } from './use-case/deleteFile.use-case';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(process.cwd(), 'uploads/images'),
			serveRoot: '/images',
		}),
		ServeStaticModule.forRoot({
			rootPath: join(process.cwd(), 'uploads/documents'),
			serveRoot: '/documents',
		}),
	],
	controllers: [FilesController],
	providers: [SaveFileUseCase, DeleteFileUseCase],
})
export class FilesModule {}
