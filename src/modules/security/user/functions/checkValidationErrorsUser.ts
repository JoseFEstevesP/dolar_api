import { objectError } from '@/functions/objectError';
import { ConflictException } from '@nestjs/common';
import { CheckValidationErrorsUserProps } from './types';
import { userMessages } from '../user.messages';

export const checkValidationErrorsUser = <T extends Record<string, unknown>>({
	data,
	name,
}: CheckValidationErrorsUserProps<T>): void => {
	const typedData = data as { status?: boolean; activatedAccount?: boolean };

	const possibleErrors = {
		status: objectError({
			name,
			msg: userMessages.validation.default,
		}),
		default: objectError({
			name,
			msg: userMessages.validation.disability,
		}),
		activatedAccount: objectError({
			name,
			msg: userMessages.validation.activatedAccount,
		}),
	};

	if (typedData.status === false) {
		throw new ConflictException(possibleErrors.default);
	}

	if (typedData.status === true) {
		throw new ConflictException(possibleErrors.status);
	}

	if (typedData.activatedAccount === false) {
		throw new ConflictException(possibleErrors.activatedAccount);
	}
};

export const checkValidationErrorsUserLogin = <
	T extends Record<string, unknown>,
>({
	data,
	name,
}: CheckValidationErrorsUserProps<T>) => {
	const typedData = data as { status?: boolean };
	const possibleErrors = {
		status: objectError({
			name,
			msg: userMessages.msg.login.status,
		}),
	};

	return !typedData.status && possibleErrors['status'];
};
