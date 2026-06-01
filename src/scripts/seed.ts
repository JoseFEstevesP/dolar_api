import 'dotenv/config';
import pg from 'pg';
import { seedRoles } from './seed/roles.seed.js';
import { seedUsers } from './seed/users.seed.js';

const HOST = process.env.DATABASE_HOST;
const PORT = parseInt(process.env.DATABASE_PORT || '5432');

async function seed() {
	const pool = new pg.Pool({
		host: HOST,
		port: PORT,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DB,
	});

	const client = await pool.connect();

	try {
		console.log('✓ Conexión a DB establecida');
		await client.query('BEGIN');

		console.log('\n🧹 Limpiando tablas existentes...');
		await client.query('DELETE FROM audit CASCADE');
		await client.query('DELETE FROM "HistoryPayments" CASCADE');
		await client.query('DELETE FROM "Payments" CASCADE');
		await client.query('DELETE FROM "PaymentMethods" CASCADE');
		await client.query('DELETE FROM "Plans" CASCADE');
		await client.query('DELETE FROM "Systems" CASCADE');
		await client.query('DELETE FROM "Languages" CASCADE');
		await client.query('DELETE FROM "CompanyApplications" CASCADE');
		await client.query('DELETE FROM "Notifications" CASCADE');
		await client.query('DELETE FROM "CompanySystems" CASCADE');
		await client.query('DELETE FROM "Companys" CASCADE');
		await client.query('DELETE FROM users CASCADE');
		await client.query('DELETE FROM roles CASCADE');
		console.log('✓ Datos existentes eliminados');

		console.log('\n📦 Ejecutando seeds...\n');

		const rolesResult = await seedRoles(client);
		console.log(`✓ Roles: ${rolesResult.created} creados`);

		const usersResult = await seedUsers(client, rolesResult.records);
		console.log(`✓ Usuarios: ${usersResult.created} creados`);

		await client.query('COMMIT');

		console.log('\n========================================');
		console.log('SEED COMPLETADO EXITOSAMENTE');
		console.log('========================================');
		console.log('\nResumen:');
		console.log(`  - Roles: ${rolesResult.created} (3 base + 50 generados)`);
		console.log(`  - Usuarios: ${usersResult.created} (3 base + 50 generados)`);
		console.log('\nCredenciales de prueba:');
		console.log(
			'  Email: admin@admin.com | Password: P@ssw0rd123 | Rol: Administrador',
		);
		console.log(
			'  Email: test@test.com | Password: P@ssw0rd123 | Rol: Usuario',
		);
		console.log(
			'  Email: viewer@test.com | Password: P@ssw0rd123 | Rol: Visor',
		);
		console.log('========================================\n');

		client.release();
		await pool.end();
	} catch (error) {
		await client.query('ROLLBACK');
		console.error('Error durante el seed:', error);
		client.release();
		await pool.end();
		process.exit(1);
	}
}

seed();
