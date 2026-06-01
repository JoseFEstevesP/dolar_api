import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { userMessages } from '../user.messages';

export class UserActivateCountDTO {
	@ApiProperty({
		example: '1234567890123',
		description: 'Código de activación de la cuenta',
	})
	@IsString({ message: userMessages.dto.stringValue })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@Length(1, 7, { message: userMessages.validation.dto.code.length })
	@Matches(/^\d+$/, {
		message: userMessages.validation.dto.code.invalidCharacters,
	})
	@Transform(({ value }) => value.trim())
	declare readonly code: string;
}
