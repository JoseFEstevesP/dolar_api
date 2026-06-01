import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsDefined,
	IsNotEmpty,
	IsStrongPassword,
	IsUUID,
} from 'class-validator';
import { userMessages } from '../user.messages';

export class UserUpdatePasswordDTO {
	@ApiProperty({
		example: 'P@ssw0rd123',
		description: 'Nueva contraseña del usuario',
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
	declare readonly newPassword: string;

	@ApiProperty({
		example: 'P@ssw0rd123',
		description: 'Confirmación de la nueva contraseña del usuario',
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
	declare readonly confirmPassword: string;

	@ApiProperty({
		example: 'a4e1e8b0-6f1f-4b9d-8c1a-2b3c4d5e6f7g',
		description: 'Identificador único del usuario',
	})
	@IsUUID('all', { message: userMessages.dto.uid.valid })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@IsDefined({ message: userMessages.dto.defined })
	declare readonly uidUser: string;
}
