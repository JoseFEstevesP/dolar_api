import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDetail {
	@ApiProperty({ example: 'field' })
	field!: string;

	@ApiProperty({ example: 'Error message' })
	message!: string;
}

export class ApiError {
	@ApiProperty({ example: 400 })
	code!: number;

	@ApiProperty({ example: 'Bad Request' })
	name!: string;

	@ApiProperty({ example: 'Error message' })
	message!: string;

	@ApiProperty({ type: [ApiErrorDetail], required: false })
	details?: ApiErrorDetail[];
}

export class ApiErrorResponse {
	@ApiProperty({ example: false })
	success!: false;

	@ApiProperty({ type: ApiError })
	error!: ApiError;
}

export class ApiUnauthorizedResponse {
	@ApiProperty({ example: false })
	success!: false;

	@ApiProperty()
	error!: {
		code: number;
		name: string;
		message: string;
	};
}

export class ApiForbiddenResponse {
	@ApiProperty({ example: false })
	success!: false;

	@ApiProperty()
	error!: {
		code: number;
		name: string;
		message: string;
	};
}

export class ApiNotFoundResponse {
	@ApiProperty({ example: false })
	success!: false;

	@ApiProperty()
	error!: {
		code: number;
		name: string;
		message: string;
	};
}

export class ApiTooManyRequestsResponse {
	@ApiProperty({ example: false })
	success!: false;

	@ApiProperty()
	error!: {
		code: number;
		name: string;
		message: string;
	};
}

export class ApiValidationError {
	@ApiProperty({ example: 'email' })
	field!: string;

	@ApiProperty({ example: 'El correo electrónico es requerido' })
	message!: string;
}

export class ApiValidationErrorResponse {
	@ApiProperty({ example: false })
	success!: false;

	@ApiProperty()
	error!: {
		code: number;
		name: string;
		message: string;
		details: ApiValidationError[];
	};
}
