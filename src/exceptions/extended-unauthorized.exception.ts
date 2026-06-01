import { UnauthorizedException, HttpStatus } from '@nestjs/common';
import { errorResponse, ApiErrorDetail } from '@/dto/api-response-wrapper.dto';

export class ExtendedUnauthorizedException extends UnauthorizedException {
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
			message = `Los campos ${fields.join(', ')} no están autorizados.`;
		}

		super(message || 'No autorizado');
		this._responseObj = responseObj;
		this._statusCode = HttpStatus.UNAUTHORIZED;
		this._message = message || 'No autorizado';
	}

	getResponse(): ReturnType<typeof errorResponse> {
		const details: ApiErrorDetail[] = Object.entries(this._responseObj).map(([field, value]) => ({
			field,
			message: value.message,
		}));
		return errorResponse(this._statusCode, this._message, details);
	}
}