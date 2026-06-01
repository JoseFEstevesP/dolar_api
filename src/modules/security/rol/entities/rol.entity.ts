import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
	tableName: 'roles',
	indexes: [
		{ unique: true, fields: ['name'], name: 'idx_role_name' },
		{ fields: ['status'], name: 'idx_role_status' },
	],
})
export class Role extends Model<Role> {
	@ApiProperty({
		example: 'a4e1e8b0-6f1f-4b9d-8c1a-2b3c4d5e6f7g',
		description: 'Identificador único del rol',
	})
	@Column({
		primaryKey: true,
		unique: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	declare uid: string;

	@ApiProperty({
		example: 'Administrador',
		description: 'Nombre del rol',
	})
	@Column({ allowNull: false, type: DataType.STRING })
	declare name: string;

	@ApiProperty({
		example: 'Rol con todos los permisos',
		description: 'Descripción del rol',
	})
	@Column({ allowNull: false, type: DataType.STRING })
	declare description: string;

	@ApiProperty({
		example: ['user.add', 'user.read'],
		description: 'Permisos del rol',
	})
	@Column({ allowNull: false, type: DataType.ARRAY(DataType.TEXT) })
	declare permissions: string[];

	@ApiProperty({
		example: true,
		description: 'Estado del rol',
	})
	@Column({ defaultValue: true, allowNull: false, type: DataType.BOOLEAN })
	declare status: boolean;
}
