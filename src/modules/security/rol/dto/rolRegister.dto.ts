import { ApiProperty } from '@nestjs/swagger';
import {
	ArrayNotEmpty,
	IsArray,
	IsDefined,
	IsEnum,
	IsNotEmpty,
	IsString,
	Length,
} from 'class-validator';
import { Permission } from '../enum/permissions';
import { rolMessages } from '../rol.messages';

export class RolRegisterDTO {
	@ApiProperty({
		example: 'rol1',
		description: 'Nombre del rol',
	})
	@IsString({ message: rolMessages.validation.dto.stringValue })
	@IsNotEmpty({ message: rolMessages.validation.dto.empty })
	@Length(3, 255, {
		message: rolMessages.validation.dto.lengthValue,
	})
	@IsDefined({ message: rolMessages.validation.dto.defined })
	declare readonly name: string;

	@ApiProperty({
		example: 'Rol de administrador',
		description: 'Descripción del rol',
	})
	@IsString({ message: rolMessages.validation.dto.stringValue })
	@IsNotEmpty({ message: rolMessages.validation.dto.empty })
	@Length(3, 255, {
		message: rolMessages.validation.dto.lengthValue,
	})
	@IsDefined({ message: rolMessages.validation.dto.defined })
	declare readonly description: string;

	@ApiProperty({
		example: [
			Permission.rol,
			Permission.rolAdd,
			Permission.rolDelete,
			Permission.rolRead,
			Permission.rolReadOne,
			Permission.rolUpdate,
		],
		description: 'Lista de permisos del rol',
	})
	@IsArray({ message: rolMessages.validation.dto.arrayValue })
	@ArrayNotEmpty({ message: rolMessages.validation.dto.permission })
	@IsEnum(Permission, {
		each: true,
		message: rolMessages.validation.dto.stringValue,
	})
	@IsDefined({ message: rolMessages.validation.dto.defined })
	declare readonly permissions: Permission[];
}
