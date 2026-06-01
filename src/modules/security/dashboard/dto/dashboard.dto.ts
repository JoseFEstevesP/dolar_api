import { ApiProperty } from '@nestjs/swagger';

export class UsersByStatusDTO {
	@ApiProperty({ example: 10, description: 'Cantidad de usuarios activos' })
	declare readonly active: number;

	@ApiProperty({ example: 2, description: 'Cantidad de usuarios inactivos' })
	declare readonly inactive: number;
}

export class UsersByActivationDTO {
	@ApiProperty({ example: 8, description: 'Usuarios con cuenta activada' })
	declare readonly activated: number;

	@ApiProperty({ example: 4, description: 'Usuarios pendientes de activación' })
	declare readonly pending: number;
}

export class UsersByRoleDTO {
	@ApiProperty({ example: 'Administrador', description: 'Nombre del rol' })
	declare readonly rolName: string;

	@ApiProperty({ example: 5, description: 'Cantidad de usuarios con este rol' })
	declare readonly count: number;
}

export class DashboardResponseDTO {
	@ApiProperty({ example: 50, description: 'Total de usuarios registrados' })
	declare readonly totalUsers: number;

	@ApiProperty({ type: UsersByStatusDTO, description: 'Usuarios por estado' })
	declare readonly usersByStatus: UsersByStatusDTO;

	@ApiProperty({
		type: UsersByActivationDTO,
		description: 'Usuarios por estado de activación',
	})
	declare readonly usersByActivation: UsersByActivationDTO;

	@ApiProperty({
		type: [UsersByRoleDTO],
		description: 'Usuarios por rol',
	})
	declare readonly usersByRole: UsersByRoleDTO[];

	@ApiProperty({
		example: 8,
		description: 'Cantidad de usuarios con sesión activa',
	})
	declare readonly activeUsers: number;
}
