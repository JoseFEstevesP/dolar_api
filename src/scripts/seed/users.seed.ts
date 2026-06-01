import bcrypt from 'bcrypt';
import type pg from 'pg';

interface RoleRecord {
	uid: string;
	name: string;
	description: string;
	permissions: string[];
}

interface UserRecord {
	uid: string;
	email: string;
	uidRol: string;
}

const SALT_ROUNDS = 10;

export async function seedUsers(
	client: pg.PoolClient,
	roles: RoleRecord[],
): Promise<{ created: number; records: UserRecord[] }> {
	const records: UserRecord[] = [];

	const hashedPassword = await bcrypt.hash('P@ssw0rd123', SALT_ROUNDS);

	const adminRol = roles.find(r => r.name === 'Administrador');
	const userRol = roles.find(r => r.name === 'Usuario');
	const viewerRol = roles.find(r => r.name === 'Visor');

	const userAdminUid = crypto.randomUUID();
	const userTestUid = crypto.randomUUID();
	const userViewerUid = crypto.randomUUID();

	const baseUsers = [
		[
			userAdminUid,
			'Admin',
			'System',
			'041234567',
			'admin@admin.com',
			hashedPassword,
			'local',
			adminRol?.uid,
		],
		[
			userTestUid,
			'Test',
			'User',
			'04149876543',
			'test@test.com',
			hashedPassword,
			'local',
			userRol?.uid,
		],
		[
			userViewerUid,
			'Viewer',
			'User',
			'04141112222',
			'viewer@test.com',
			hashedPassword,
			'local',
			viewerRol?.uid,
		],
	];

	for (const user of baseUsers) {
		await client.query(
			`INSERT INTO users (uid, names, surnames, phone, email, password, provider, status, "activatedAccount", "attemptCount", "uidRol", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, 0, $8, NOW(), NOW())`,
			user,
		);
		records.push({ uid: user[0] as string, email: user[4] as string, uidRol: user[7] as string });
	}

	const generatedRoles = roles.slice(3);

	for (let i = 1; i <= 50; i++) {
		const uid = crypto.randomUUID();
		const rol = generatedRoles[i % generatedRoles.length];

		await client.query(
			`INSERT INTO users (uid, names, surnames, phone, email, password, provider, status, "activatedAccount", "attemptCount", "uidRol", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, 0, $8, NOW(), NOW())`,
			[
				uid,
				`Usuario${i}`,
				`Apellido${i}`,
				`0414111${String(i).padStart(4, '0')}`,
				`usuario${i}@test.com`,
				hashedPassword,
				'local',
				rol.uid,
			],
		);

		records.push({ uid, email: `usuario${i}@test.com`, uidRol: rol.uid });
	}

	return { created: records.length, records };
}
