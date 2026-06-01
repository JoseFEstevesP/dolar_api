import { regexPhone } from '@/constants/dataConstants';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsDefined,
	IsEmail,
	IsNotEmpty,
	IsString,
	IsStrongPassword,
	IsUUID,
	Length,
	Matches,
	ValidationOptions,
	ValidationArguments,
	registerDecorator,
} from 'class-validator';
import { userMessages } from '../user.messages';

export function Match(property: string, validationOptions?: ValidationOptions) {
	return (object: object, propertyName: string) => {
		registerDecorator({
			name: 'Match',
			target: object.constructor,
			propertyName: propertyName,
			constraints: [property],
			options: validationOptions,
			validator: {
				validate(value: unknown, args: ValidationArguments) {
					const [relatedPropertyName] = args.constraints;
					const relatedValue = (args.object as Record<string, unknown>)[
						relatedPropertyName
					];
					return value === relatedValue;
				},
				defaultMessage(args: ValidationArguments) {
					const [relatedPropertyName] = args.constraints;
					return `${propertyName} must match ${relatedPropertyName}`;
				},
			},
		});
	};
}

export class UserRegisterDTO {
	@ApiProperty({
		example: 'John',
		description: 'Nombres del usuario',
	})
	@IsString({ message: userMessages.dto.stringValue })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@Length(3, 255, { message: userMessages.dto.lengthValue })
	@IsDefined({ message: userMessages.dto.defined })
	@Transform(({ value }) => value.trim())
	declare readonly names: string;

	@ApiProperty({
		example: 'Doe',
		description: 'Apellidos del usuario',
	})
	@IsString({ message: userMessages.dto.stringValue })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@Length(3, 255, { message: userMessages.dto.lengthValue })
	@IsDefined({ message: userMessages.dto.defined })
	@Transform(({ value }) => value.trim())
	declare readonly surnames: string;

	@ApiProperty({
		example: 'jhon.doe@example.com',
		description: 'Correo electrónico del usuario',
	})
	@IsEmail({}, { message: userMessages.validation.dto.email })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@IsDefined({ message: userMessages.dto.defined })
	@Transform(({ value }) => value.trim())
	declare readonly email: string;

	@ApiProperty({
		example: '1234567890',
		description: 'Teléfono del usuario',
	})
	@IsString({ message: userMessages.dto.stringValue })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@IsDefined({ message: userMessages.dto.defined })
	@Transform(({ value }) => value.trim())
	@Matches(regexPhone, {
		message: userMessages.validation.dto.phone,
	})
	declare readonly phone: string;

	@ApiProperty({
		example: 'P@ssw0rd123',
		description: 'Contraseña del usuario',
	})
	@IsStrongPassword(
		{
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
		},
		{ message: userMessages.validation.dto.password },
	)
	@IsNotEmpty({ message: userMessages.dto.empty })
	@Transform(({ value }) => value.trim())
	@IsDefined({ message: userMessages.dto.defined })
	declare readonly password: string;

	@ApiProperty({
		example: 'P@ssw0rd123',
		description: 'Confirmación de la contraseña del usuario',
	})
	@IsString({ message: userMessages.dto.stringValue })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@IsDefined({ message: userMessages.dto.defined })
	@Match('password', { message: userMessages.validation.dto.passwordMatch })
	declare readonly confirmPassword: string;

	@ApiProperty({
		example: 'a4e1e8b0-6f1f-4b9d-8c1a-2b3c4d5e6f7g',
		description: 'Identificador único del rol del usuario',
	})
	@IsUUID('all', { message: userMessages.dto.uid.valid })
	@IsString({ message: userMessages.dto.stringValue })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@IsDefined({ message: userMessages.dto.defined })
	declare readonly uidRol?: string;
}
