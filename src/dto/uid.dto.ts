import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator';

export class UidDTO {
	@ApiProperty({
		example: 'a4e1e8b0-6f1f-4b9d-8c1a-2b3c4d5e6f7g',
		description: 'UID único del recurso',
	})
	@IsUUID('all', { message: 'UID inválido' })
	@IsNotEmpty({ message: 'UID no puede estar vacío' })
	@IsDefined({ message: 'UID debe estar definido' })
	declare readonly uid: string;
}
