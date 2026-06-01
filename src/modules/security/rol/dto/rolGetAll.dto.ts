import { queryDTO } from '@/dto/query.dto';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderRolProperty } from '../enum/orderProperty';
import { Permission } from '../enum/permissions';
import { rolMessages } from '../rol.messages';

export class RolGetAllDTO extends PartialType(queryDTO) {
	@ApiProperty({
		example: OrderRolProperty.name,
		enum: OrderRolProperty,
		description: 'Nombre de la propiedad por la que se ordenara',
	})
	@IsOptional()
	@IsEnum(OrderRolProperty, {
		message: rolMessages.validation.dto.enumValue,
	})
	readonly orderProperty?: OrderRolProperty;

	@ApiProperty({
		example: Permission.rol,
		enum: Permission,
		description: 'Permiso por el que se filtrara',
	})
	@IsOptional()
	@IsEnum(Permission, {
		message: rolMessages.validation.dto.permission,
	})
	readonly permission?: Permission;
}
