#!/usr/bin/env node

/**
 * Script para configurar la base de datos de test antes de ejecutar los tests
 * Crea la base de datos test_db si no existe y ejecuta las migraciones
 */

import { Client } from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { spawn } from 'child_process';

// Cargar variables de entorno de .env.test
const envPath = resolve(process.cwd(), '.env.test');
const envConfig = dotenv.config({ path: envPath, quiet: true });

if (envConfig.parsed) {
	Object.entries(envConfig.parsed).forEach(([key, value]) => {
		process.env[key] = value;
	});
}

async function runMigrations() {
	return new Promise((resolve, reject) => {
		console.log('Ejecutando migraciones...');
		const migrate = spawn('npx', ['sequelize-cli', 'db:migrate'], {
			env: { ...process.env, NODE_ENV: 'test' },
			shell: true,
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		migrate.on('close', code => {
			if (code === 0) {
				console.log('Migraciones ejecutadas correctamente.');
				resolve(true);
			} else {
				console.error(`Migraciones fallaron con código: ${code}`);
				reject(new Error(`Migration failed with code ${code}`));
			}
		});

		migrate.on('error', err => {
			reject(err);
		});
	});
}

async function setupTestDatabase() {
	const dbConfig = {
		host: process.env.DATABASE_HOST || 'localhost',
		port: Number(process.env.DATABASE_PORT) || 5432,
		user: process.env.POSTGRES_USER || 'postgres',
		password: process.env.POSTGRES_PASSWORD || 'postgres',
		database: 'postgres', // Conectar a la base de datos por defecto
	};

	const testDbName = process.env.POSTGRES_DB || 'test_db';

	let client;

	try {
		console.log(
			`Conectando a PostgreSQL en ${dbConfig.host}:${dbConfig.port}...`,
		);

		// Conectar a la base de datos postgres (por defecto)
		client = new Client(dbConfig);
		await client.connect();
		console.log('Conexión establecida.');

		// Verificar si la base de datos de test ya existe
		const result = await client.query(
			'SELECT 1 FROM pg_database WHERE datname = $1',
			[testDbName],
		);

		if (result.rows.length > 0) {
			console.log(`La base de datos "${testDbName}" ya existe.`);
		} else {
			console.log(`Creando base de datos "${testDbName}"...`);
			await client.query(`CREATE DATABASE "${testDbName}"`);
			console.log(`Base de datos "${testDbName}" creada exitosamente.`);
		}

		// Ejecutar migraciones
		try {
			await runMigrations();
		} catch (migrationError) {
			console.error('Error ejecutando migraciones:', migrationError.message);
			return false;
		}

		return true;
	} catch (error) {
		console.error(
			'Error configurando la base de datos de test:',
			error.message,
		);

		// Si el error es de conexión, dar más detalles
		if (error.code === 'ECONNREFUSED') {
			console.error('\nNo se pudo conectar a PostgreSQL.');
			console.error(
				'Verifica que el contenedor de base de datos esté corriendo:',
			);
			console.error('  docker ps | grep postgres');
			console.error('\nO ejecuta:');
			console.error('  docker compose up -d db');
		}

		if (error.code === '28P01') {
			console.error(
				'\nContraseña incorrecta. Verifica las credenciales en .env.test',
			);
		}

		return false;
	} finally {
		if (client) {
			await client.end();
		}
	}
}

// Ejecutar el setup
setupTestDatabase()
	.then(success => {
		if (success) {
			console.log('\n✅ Setup de base de datos completado.\n');
			process.exit(0);
		} else {
			console.log('\n❌ Setup de base de datos fallido.\n');
			process.exit(1);
		}
	})
	.catch(error => {
		console.error('\n❌ Error inesperado:', error);
		process.exit(1);
	});
