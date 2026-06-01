import { queryDTO } from '@/dto/query.dto';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderUserProperty } from '../enum/orderProperty';
import { userMessages } from '../user.messages';

export class UserGetAllDTO extends PartialType(queryDTO) {
	@ApiProperty({
		enum: OrderUserProperty,
		example: OrderUserProperty.names,
		description: 'Propiedad por la cual ordenar los resultados',
		required: false,
	})
	@IsEnum(OrderUserProperty, {
		message: userMessages.dto.enumValue,
	})
	@IsOptional()
	readonly orderProperty?: OrderUserProperty;

	@ApiProperty({
		example: 'John',
		description:
			'Texto para buscar usuarios por nombres, apellidos o correo electrónico',
		required: false,
	})
	@IsString({ message: userMessages.dto.stringValue })
	@IsOptional()
	readonly search?: string;
}
