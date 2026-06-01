import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsStrongPassword } from 'class-validator';
import { userMessages } from '../user.messages';

export class UserNewPasswordDTO {
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
}
