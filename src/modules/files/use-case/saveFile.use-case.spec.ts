import { BadRequestException } from '@nestjs/common';
import { SaveFileUseCase } from './saveFile.use-case';

vi.mock('fs', () => {
	const mockFs = {
		existsSync: vi.fn(() => true),
		mkdirSync: vi.fn(),
		promises: {
			writeFile: vi.fn(),
		},
	};
	return {
		...mockFs,
		default: mockFs,
	};
});

describe('SaveFileUseCase', () => {
	let saveFileUseCase: SaveFileUseCase;
	const mockFile: Express.Multer.File = {
		fieldname: 'file',
		originalname: 'test-image.jpg',
		encoding: '7bit',
		mimetype: 'image/jpeg',
		buffer: Buffer.from('fake-image-data'),
		size: 1024,
		destination: '',
		filename: '',
		path: '',
		stream: null as any,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		saveFileUseCase = new SaveFileUseCase();
	});

	it('should throw BadRequestException when file is not provided', async () => {
		await expect(
			saveFileUseCase.execute(null as any, 'image'),
		).rejects.toThrow(BadRequestException);
	});

	it('should throw BadRequestException when type is invalid', async () => {
		await expect(
			saveFileUseCase.execute(mockFile, 'invalid' as any),
		).rejects.toThrow(BadRequestException);
	});

	it('should throw BadRequestException for invalid image mime type', async () => {
		const invalidFile = { ...mockFile, mimetype: 'image/svg+xml' };

		await expect(
			saveFileUseCase.execute(invalidFile, 'image'),
		).rejects.toThrow(BadRequestException);
	});

	it('should throw BadRequestException for invalid document mime type', async () => {
		const invalidFile = { ...mockFile, mimetype: 'text/plain' };

		await expect(
			saveFileUseCase.execute(invalidFile, 'document'),
		).rejects.toThrow(BadRequestException);
	});

	it('should accept valid image file', async () => {
		const fs = await import('fs');

		const filename = await saveFileUseCase.execute(mockFile, 'image');

		expect(filename).toBeDefined();
		expect(filename).toMatch(/\.jpg$/);
		expect(fs.promises.writeFile).toHaveBeenCalled();
	});

	it('should accept valid document file', async () => {
		const pdfFile: Express.Multer.File = {
			...mockFile,
			mimetype: 'application/pdf',
			originalname: 'document.pdf',
		};

		const filename = await saveFileUseCase.execute(pdfFile, 'document');

		expect(filename).toMatch(/\.pdf$/);
	});

	it('should throw BadRequestException when write fails', async () => {
		const fs = await import('fs');
		(fs.promises.writeFile as any).mockRejectedValue(new Error('Disk full'));

		await expect(
			saveFileUseCase.execute(mockFile, 'image'),
		).rejects.toThrow(BadRequestException);
	});
});
