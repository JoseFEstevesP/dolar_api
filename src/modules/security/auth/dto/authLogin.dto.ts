import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthLoginDTO {
	@ApiProperty({
		example: 'john@doe.com',
		description: 'Correo electrónico del usuario',
	})
	@IsEmail()
	@IsNotEmpty()
	email!: string;

	@ApiProperty({
		example: 'P@ssw0rd123',
		description: 'Contraseña del usuario',
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	password!: string;
}
