import { Order } from '@/constants/dataConstants';
import { globalMsg } from '@/globalMsg';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator';

export class queryDTO {
	@ApiProperty({
		example: 'true',
		description: 'Filtrar por estado',
	})
	@IsString({ message: globalMsg.dto.stringValue })
	@IsOptional()
	declare readonly status?: string;

	@ApiProperty({
		example: 'texto a buscar',
		description: 'Texto a buscar',
	})
	@IsString({ message: globalMsg.dto.stringValue })
	@IsOptional()
	declare readonly search?: string;

	@ApiProperty({
		example: 1,
		description: 'Pagina a buscar',
	})
	@IsString({ message: globalMsg.dto.stringValue })
	@IsDefined({ message: globalMsg.dto.defined })
	declare readonly page: string;

	@ApiProperty({
		example: 10,
		description: 'Cantidad de registros por pagina',
	})
	@IsString({ message: globalMsg.dto.stringValue })
	@IsDefined({ message: globalMsg.dto.defined })
	declare readonly limit: string;

	@ApiProperty({
		example: Order.ASC,
		description: 'Ordenar por',
	})
	@IsEnum(Order, { message: globalMsg.dto.enumValue })
	@IsDefined({ message: globalMsg.dto.defined })
	declare readonly order: Order;
}
