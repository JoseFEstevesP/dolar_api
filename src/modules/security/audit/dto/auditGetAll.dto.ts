import { queryDTO } from '@/dto/query.dto';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { auditMessages } from '../audit.messages';
import { OrderAuditProperty } from '../enum/orderProperty';

export class AuditGetAllDTO extends PartialType(queryDTO) {
	@ApiProperty({
		example: OrderAuditProperty.names,
		enum: OrderAuditProperty,
		description: 'Propiedad por la que se ordenaran las auditorias',
	})
	@IsOptional()
	@IsEnum(OrderAuditProperty, {
		message: auditMessages.validation.dto.enumValue,
	})
	readonly orderProperty?: OrderAuditProperty;
}
