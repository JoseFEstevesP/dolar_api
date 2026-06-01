import { HttpException, HttpStatus } from '@nestjs/common';
import { errorResponse, ApiErrorDetail } from '@/dto/api-response-wrapper.dto';

export class ExtendedTooManyRequestsException extends HttpException {
	private readonly _responseObj: Record<string, { message: string }>;
	private readonly _statusCode: number;
	private readonly _message: string;

	constructor(responseObj: Record<string, { message: string }>, message = 'Demasiadas solicitudes') {
		super(message, HttpStatus.TOO_MANY_REQUESTS);
		this._responseObj = responseObj;
		this._statusCode = HttpStatus.TOO_MANY_REQUESTS;
		this._message = message;
	}

	getResponse(): ReturnType<typeof errorResponse> {
		const details: ApiErrorDetail[] = Object.entries(this._responseObj).map(([field, value]) => ({
			field,
			message: value.message,
		}));
		return errorResponse(this._statusCode, this._message, details);
	}
}