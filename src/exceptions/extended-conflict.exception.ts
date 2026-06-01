import { ConflictException, HttpStatus } from '@nestjs/common';
import { errorResponse, ApiErrorDetail } from '@/dto/api-response-wrapper.dto';

export class ExtendedConflictException extends ConflictException {
	private readonly _responseObj: Record<string, { message: string }>;
	private readonly _statusCode: number;
	private readonly _message: string;

	constructor(responseObj: Record<string, { message: string }>) {
		const fields = Object.keys(responseObj);
		let message = '';
		if (fields.length > 0) {
			const first = responseObj[fields[0]];
			if (first && typeof first === 'object' && 'message' in first) {
				message = first.message;
			}
		}
		if (fields.length > 1) {
			message = `Los campos ${fields.join(', ')} tienen conflictos.`;
		}

		super(message || 'Conflicto');
		this._responseObj = responseObj;
		this._statusCode = HttpStatus.CONFLICT;
		this._message = message || 'Conflicto';
	}

	getResponse(): ReturnType<typeof errorResponse> {
		const details: ApiErrorDetail[] = Object.entries(this._responseObj).map(([field, value]) => ({
			field,
			message: value.message,
		}));
		return errorResponse(this._statusCode, this._message, details);
	}
}