import { Role } from '@/modules/security/rol/entities/rol.entity';
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
	tableName: 'users',
	indexes: [
		{ unique: true, fields: ['email'], name: 'idx_user_email' },
		{ fields: ['uidRol'], name: 'idx_user_uid_rol' },
		{ fields: ['status'], name: 'idx_user_status' },
		{ fields: ['activatedAccount'], name: 'idx_user_activated_account' },
		{ fields: ['phone'], name: 'idx_user_phone' },
		{ fields: ['status', 'uidRol'], name: 'idx_user_status_rol' },
		{ fields: ['status', 'activatedAccount'], name: 'idx_user_status_active' },
	],
})
export class User extends Model<User> {
	@ApiProperty({
		example: crypto.randomUUID(),
		description: 'Identificador único del usuario',
	})
	@Column({
		primaryKey: true,
		unique: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	declare uid: string;

	@ApiProperty({ example: 'John', description: 'Nombre completo del usuario' })
	@Column({ allowNull: false, type: DataType.STRING })
	declare names: string;

	@ApiProperty({ example: 'Doe', description: 'Apellido del usuario' })
	@Column({ allowNull: false, type: DataType.STRING })
	declare surnames: string;

	@ApiProperty({
		example: '0414151234',
		description: 'Número de teléfono del usuario',
	})
	@Column({ allowNull: false, type: DataType.STRING })
	declare phone: string;

	@ApiProperty({
		example: 'john@doe.com',
		description: 'Correo electrónico del usuario',
	})
	@Column({ allowNull: false, type: DataType.STRING, unique: true })
	declare email: string;

	@ApiProperty({
		example: 'P@ssw0rd123',
		description: 'Contraseña del usuario',
	})
	@Column({ allowNull: true, type: DataType.STRING })
	declare password: string;

	@ApiProperty({
		example: 'local',
		description: 'Proveedor de autenticación',
	})
	@Column({ defaultValue: 'local', allowNull: false, type: DataType.STRING })
	declare provider: string;

	@ApiProperty({
		example: true,
		description: 'Estado del usuario',
	})
	@Column({ defaultValue: true, allowNull: false, type: DataType.BOOLEAN })
	declare status: boolean;

	@ApiProperty({
		example: '123456789',
		description: 'Código de verificación del usuario',
	})
	@Column({ type: DataType.STRING })
	declare code: string;

	@ApiProperty({
		example: true,
		description: 'Activo o no el usuario',
	})
	@Column({ defaultValue: false, allowNull: false, type: DataType.BOOLEAN })
	declare activatedAccount: boolean;

	@ApiProperty({
		example: 0,
		description: 'Cantidad de intentos fallidos para el usuario',
	})
	@Column({ defaultValue: 0, allowNull: false, type: DataType.INTEGER })
	declare attemptCount: number;

	@ApiProperty({
		example: '2021-01-01T00:00:00.000Z',
		description: 'Fecha de la última vez que el usuario intentó iniciar sesión',
	})
	@Column({ defaultValue: null, type: DataType.DATE })
	declare dataOfAttempt: string;

	@ApiProperty({
		example: crypto.randomUUID(),
		description: 'Uid del rol del usuario',
	})
	@ForeignKey(() => Role)
	@Column({ allowNull: false, type: DataType.UUID })
	declare uidRol: string;

	@BelongsTo(() => Role)
	declare rol: Role;
}
