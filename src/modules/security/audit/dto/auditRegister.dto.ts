import { ApiProperty } from '@nestjs/swagger';
import {
	IsArray,
	IsDefined,
	IsNotEmpty,
	IsString,
	IsUUID,
} from 'class-validator';
import { auditMessages } from '../audit.messages';

export class AuditRegisterDTO {
	@ApiProperty({
		example: crypto.randomUUID(),
		description: 'Identificador único del usuario',
	})
	@IsUUID('all', { message: auditMessages.validation.dto.uidUser })
	@IsNotEmpty({ message: auditMessages.validation.dto.empty })
	@IsDefined({ message: auditMessages.validation.dto.defined })
	declare readonly uidUser: string;

	@ApiProperty({
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
		description: 'Token de refresco',
	})
	@IsString({ message: auditMessages.validation.dto.refreshToken })
	@IsNotEmpty({ message: auditMessages.validation.dto.empty })
	@IsDefined({ message: auditMessages.validation.dto.defined })
	declare readonly refreshToken: string;

	@ApiProperty({
		example: ['data1', 'data2'],
		description: 'Datos del token',
	})
	@IsArray({ message: auditMessages.validation.dto.dataToken })
	@IsNotEmpty({ message: auditMessages.validation.dto.empty })
	@IsDefined({ message: auditMessages.validation.dto.defined })
	declare readonly dataToken: string[];
}
