import { User } from '@/modules/security/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
	BelongsTo,
	Column,
	DataType,
	ForeignKey,
	Model,
	Table,
} from 'sequelize-typescript';

@Table({
	tableName: 'audit',
	indexes: [
		{ fields: ['uidUser'], name: 'idx_audit_uid_user' },
		{ fields: ['createdAt'], name: 'idx_audit_created_at' },
		{ fields: ['uidUser', 'createdAt'], name: 'idx_audit_user_created' },
	],
})
export class Audit extends Model<Audit> {
	@ApiProperty({
		example: crypto.randomUUID(),
		description: 'Identificador único de la auditoria',
	})
	@Column({
		primaryKey: true,
		unique: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	declare uid: string;

	@ApiProperty({
		example: crypto.randomUUID(),
		description: 'Identificador único del usuario',
	})
	@ForeignKey(() => User)
	@Column({ allowNull: false, type: DataType.UUID })
	declare uidUser: string;

	@BelongsTo(() => User)
	declare user: User;

	@ApiProperty({
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
		description: 'Token de refresco',
	})
	@Column({ allowNull: false, type: DataType.TEXT })
	declare refreshToken: string;

	@ApiProperty({
		example: ['data1', 'data2'],
		description: 'Datos del token',
	})
	@Column({ allowNull: false, type: DataType.ARRAY(DataType.STRING) })
	declare dataToken: string[];
}
