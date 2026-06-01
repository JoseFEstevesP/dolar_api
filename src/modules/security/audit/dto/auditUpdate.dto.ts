// auditUpdate.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsDefined,
	IsNotEmpty,
	IsOptional,
	IsUUID,
} from 'class-validator';
import { auditMessages } from '../audit.messages';
import { AuditRegisterDTO } from './auditRegister.dto';

export class AuditUpdateDTO extends PartialType(AuditRegisterDTO) {
	@ApiProperty({
		example: crypto.randomUUID(),
		description: 'Identificador único de la auditoria',
	})
	@IsUUID('all', { message: auditMessages.validation.dto.uid.valid })
	@IsNotEmpty({ message: auditMessages.validation.dto.empty })
	@IsDefined({ message: auditMessages.validation.dto.defined })
	declare readonly uid: string;

	@ApiProperty({
		example: true,
		description: 'Estado de la auditoria',
	})
	@IsBoolean({ message: auditMessages.validation.dto.status })
	@IsNotEmpty({ message: auditMessages.validation.dto.empty })
	@IsOptional()
	declare readonly status?: boolean;
}
