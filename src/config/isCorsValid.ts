import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isCorsValid', async: false })
export class IsCorsValidConstraint implements ValidatorConstraintInterface {
	validate(value: string[]) {
		const urlRegex = /^(https?:\/\/)?([\w.-]+)(:\d+)?(\/.*)?$/i;
		return value.every(url => urlRegex.test(url.trim()));
	}

	defaultMessage() {
		return 'Cada URL CORS debe ser válida (e.g., http://localhost:3000 or https://example.com)';
	}
}
