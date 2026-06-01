import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizeInputPipe implements PipeTransform {
	transform(value: unknown, _metadata: ArgumentMetadata): unknown {
		if (value && typeof value === 'object') {
			return this.sanitizeObject(value);
		}
		return value;
	}

	private sanitizeObject(obj: unknown): unknown {
		if (Array.isArray(obj)) {
			return obj.map(item => this.sanitizeObject(item));
		}

		if (obj !== null && typeof obj === 'object') {
			const sanitized: Record<string, unknown> = {};
			for (const key of Object.keys(obj as object)) {
				sanitized[key] = this.sanitizeValue((obj as Record<string, unknown>)[key]);
			}
			return sanitized;
		}

		return this.sanitizeValue(obj);
	}

	private sanitizeValue(value: unknown): unknown {
		if (typeof value === 'string') {
			return this.sanitizeString(value);
		}
		if (Array.isArray(value)) {
			return value.map(item => this.sanitizeValue(item));
		}
		if (value && typeof value === 'object') {
			return this.sanitizeObject(value);
		}
		return value;
	}

	private sanitizeString(value: string): string {
		return value
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
			.replace(/javascript:/gi, '')
			.replace(/on\w+\s*=/gi, '')
			.replace(/data:/gi, '')
			.trim();
	}
}
