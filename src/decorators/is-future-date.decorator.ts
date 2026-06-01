import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsFutureDate(validationOptions?: ValidationOptions) {
	return function isFutureDate(object: object, propertyName: string) {
		registerDecorator({
			name: 'isFutureDate',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: {
				validate(value: unknown) {
					if (typeof value !== 'string') return false;
					const date = new Date(value);
					if (isNaN(date.getTime())) return false;
					const today = new Date();
					today.setHours(0, 0, 0, 0);
					return date >= today;
				},
				defaultMessage(args: ValidationArguments) {
					return `${args.property} no puede ser una fecha pasada`;
				},
			},
		});
	};
}
