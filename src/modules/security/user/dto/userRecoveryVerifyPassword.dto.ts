import { PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { userMessages } from '../user.messages';
import { UserRegisterDTO } from './userRegister.dto';

export class RecoveryVerifyPasswordDTO extends PickType(UserRegisterDTO, [
	'email',
]) {
	@ApiProperty({
		example: '123456',
		description: 'Código enviado al correo electrónico del usuario',
	})
	@IsString()
	@IsNotEmpty()
	@Matches(/^\d+$/, {
		message: userMessages.validation.dto.code.invalidCharacters,
	})
	@Transform(({ value }) => value.trim())
	declare readonly code: string;
}
