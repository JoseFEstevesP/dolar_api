import type pg from 'pg';

interface RoleRecord {
	uid: string;
	name: string;
	description: string;
	permissions: string[];
}

const ALL_PERMISSIONS = [
	'SUPER',
	'USER',
	'USER_PROFILE',
	'USER_ADD',
	'USER_READ',
	'USER_READ_ONE',
	'USER_UPDATE',
	'USER_DELETE',
	'ROL',
	'ROL_ADD',
	'ROL_READ',
	'ROL_READ_ONE',
	'ROL_UPDATE',
	'ROL_DELETE',
	'AUDIT',
	'AUDIT_READ',
	'AUDIT_DELETE',
	'COMPANY',
	'COMPANY_ADD',
	'COMPANY_READ',
	'COMPANY_READ_ONE',
	'COMPANY_UPDATE',
	'COMPANY_DELETE',
	'SYSTEM',
	'SYSTEM_ADD',
	'SYSTEM_READ',
	'SYSTEM_READ_ONE',
	'SYSTEM_UPDATE',
	'SYSTEM_DELETE',
	'SUBSCRIPTION',
	'SUBSCRIPTION_ADD',
	'SUBSCRIPTION_READ',
	'SUBSCRIPTION_READ_ONE',
	'SUBSCRIPTION_UPDATE',
	'SUBSCRIPTION_DELETE',
	'PAYMENTMETHOD',
	'PAYMENTMETHOD_ADD',
	'PAYMENTMETHOD_READ',
	'PAYMENTMETHOD_READ_ONE',
	'PAYMENTMETHOD_UPDATE',
	'PAYMENTMETHOD_DELETE',
	'COMPANY',
	'COMPANY_ADD',
	'COMPANY_READ',
	'COMPANY_READ_ONE',
	'COMPANY_UPDATE',
	'COMPANY_DELETE',
];

const ROLE_NAMES = [
	'Gerente',
	'Coordinador',
	'Supervisor',
	'Analista',
	'Asistente',
	'Técnico',
	'Consultor',
	'Desarrollador',
	'Diseñador',
	'Investigador',
	'Contador',
	'Abogado',
	'SECRETARIO',
	'Recepcionista',
	'Mensajero',
	'Operador',
	'Encargado',
	'Jefe',
	'Líder',
	'Especialista',
];

function getRandomPermissions(min: number, max: number): string[] {
	const count = Math.floor(Math.random() * (max - min + 1)) + min;
	const shuffled = [...ALL_PERMISSIONS].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
}

export async function seedRoles(
	client: pg.PoolClient,
): Promise<{ created: number; records: RoleRecord[] }> {
	const records: RoleRecord[] = [];

	const adminPermissions = [ALL_PERMISSIONS[0]];
	const userPermissions = [
		'USER_READ',
		'USER_PROFILE',
		'COMPANY_READ',
		'SYSTEM_READ',
		'SUBSCRIPTION_READ',
		'PAYMENT_ADD',
		'PAYMENT_READ',
	];
	const viewerPermissions = ['USER_READ', 'COMPANY_READ', 'SYSTEM_READ'];

	const rolAdminUid = crypto.randomUUID();
	const rolUserUid = crypto.randomUUID();
	const rolViewerUid = crypto.randomUUID();

	await client.query(
		`INSERT INTO roles (uid, name, description, permissions, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, true, NOW(), NOW())`,
		[
			rolAdminUid,
			'Administrador',
			'Rol con todos los permisos del sistema',
			adminPermissions,
		],
	);
	records.push({
		uid: rolAdminUid,
		name: 'Administrador',
		description: 'Rol con todos los permisos del sistema',
		permissions: adminPermissions,
	});

	await client.query(
		`INSERT INTO roles (uid, name, description, permissions, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, true, NOW(), NOW())`,
		[rolUserUid, 'Usuario', 'Rol de usuario estándar', userPermissions],
	);
	records.push({
		uid: rolUserUid,
		name: 'Usuario',
		description: 'Rol de usuario estándar',
		permissions: userPermissions,
	});

	await client.query(
		`INSERT INTO roles (uid, name, description, permissions, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, true, NOW(), NOW())`,
		[rolViewerUid, 'Visor', 'Rol de solo lectura', viewerPermissions],
	);
	records.push({
		uid: rolViewerUid,
		name: 'Visor',
		description: 'Rol de solo lectura',
		permissions: viewerPermissions,
	});

	for (let i = 1; i <= 50; i++) {
		const uid = crypto.randomUUID();
		const name = ROLE_NAMES[i % ROLE_NAMES.length];
		const description = `Rol generado automáticamente #${i}`;
		const permissions = getRandomPermissions(3, 10);

		await client.query(
			`INSERT INTO roles (uid, name, description, permissions, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, true, NOW(), NOW())`,
			[uid, `${name} ${i}`, description, permissions],
		);

		records.push({ uid, name: `${name} ${i}`, description, permissions });
	}

	return { created: records.length, records };
}
