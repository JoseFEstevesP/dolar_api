import { OmitType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsDefined,
	IsNotEmpty,
	IsOptional,
	IsUUID,
} from 'class-validator';
import { rolMessages } from '../rol.messages';
import { RolRegisterDTO } from './rolRegister.dto';

export class RolUpdateDTO extends OmitType(RolRegisterDTO, []) {
	@ApiProperty({
		example: crypto.randomUUID(),
		description: 'Identificador único del rol',
	})
	@IsUUID('all', { message: rolMessages.validation.dto.uid.valid })
	@IsNotEmpty({ message: rolMessages.validation.dto.empty })
	@IsDefined({ message: rolMessages.validation.dto.defined })
	declare readonly uid: string;

	@ApiProperty({
		example: true,
		description: 'Estado del rol',
	})
	@IsBoolean({ message: rolMessages.validation.dto.status })
	@IsNotEmpty({ message: rolMessages.validation.dto.empty })
	@IsOptional()
	declare readonly status: boolean;
}
