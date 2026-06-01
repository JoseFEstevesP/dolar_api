import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeleteFileUseCase } from './deleteFile.use-case';

vi.mock('fs', () => {
	const mockFs = {
		existsSync: vi.fn(() => true),
		mkdirSync: vi.fn(),
		promises: {
			unlink: vi.fn(),
		},
	};
	return {
		...mockFs,
		default: mockFs,
	};
});

describe('DeleteFileUseCase', () => {
	let deleteFileUseCase: DeleteFileUseCase;

	beforeEach(() => {
		vi.clearAllMocks();
		deleteFileUseCase = new DeleteFileUseCase();
	});

	it('should throw BadRequestException when filename is not provided', async () => {
		await expect(
			deleteFileUseCase.execute('', 'image'),
		).rejects.toThrow(BadRequestException);
	});

	it('should throw BadRequestException when type is not provided', async () => {
		await expect(
			deleteFileUseCase.execute('test.jpg', '' as any),
		).rejects.toThrow(BadRequestException);
	});

	it('should throw NotFoundException when file does not exist', async () => {
		const fs = await import('fs');
		(fs.existsSync as any).mockReturnValue(false);

		await expect(
			deleteFileUseCase.execute('nonexistent.jpg', 'image'),
		).rejects.toThrow(NotFoundException);
	});

	it('should delete file when it exists', async () => {
		const fs = await import('fs');
		(fs.existsSync as any).mockReturnValue(true);

		await deleteFileUseCase.execute('test.jpg', 'image');

		expect(fs.promises.unlink).toHaveBeenCalled();
	});

	it('should delete file from documents directory', async () => {
		const fs = await import('fs');
		(fs.existsSync as any).mockReturnValue(true);

		await deleteFileUseCase.execute('doc.pdf', 'document');

		expect(fs.promises.unlink).toHaveBeenCalled();
	});
});
