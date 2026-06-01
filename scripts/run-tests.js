#!/usr/bin/env node

/**
 * Script para generar .env.test y ejecutar los tests
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import { spawn } from 'child_process';

const envTestPath = resolve(process.cwd(), '.env.test');

const defaultEnvTest = `PORT=3000
JWT_SECRET='test_jwt_secret_key_for_testing_only'
JWT_REFRESH_SECRET='test_jwt_refresh_secret_key_for_testing_only'

EMAIL_HOST=smtp.gmail.com
EMAIL_USER=test@example.com
EMAIL_PASS=testpassword

NODE_ENV=test
DEFAULT_ROL_FROM_USER=user
CORS=http://localhost:5173

DATABASE_DIALECT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
POSTGRES_USER=api_nest
POSTGRES_PASSWORD=api_nest
POSTGRES_DB=test_db

RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100

REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

SALT_ROUNDS=12

GOOGLE_CLIENT_ID=''
GOOGLE_SECRET=''
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

FRONT_END_URL=http://localhost:5173
`;

async function generateEnvTest() {
	if (existsSync(envTestPath)) {
		console.log('✅ .env.test ya existe.');
		return true;
	}

	console.log('📝 Generando .env.test...');
	try {
		writeFileSync(envTestPath, defaultEnvTest);
		console.log('✅ .env.test generado correctamente.');
		return true;
	} catch (error) {
		console.error('❌ Error al generar .env.test:', error.message);
		return false;
	}
}

async function runTests() {
	return new Promise((resolve, reject) => {
		console.log('\n🧪 Ejecutando tests...\n');

		const testProcess = spawn('pnpm', ['test'], {
			env: { ...process.env },
			shell: true,
			stdio: 'inherit',
		});

		testProcess.on('close', code => {
			if (code === 0) {
				console.log('\n✅ Tests completados correctamente.');
				resolve(true);
			} else {
				console.log(`\n❌ Tests fallaron con código: ${code}`);
				resolve(false);
			}
		});

		testProcess.on('error', err => {
			console.error('❌ Error al ejecutar tests:', err.message);
			reject(err);
		});
	});
}

async function main() {
	console.log('🚀 Iniciando script de tests...\n');

	const envGenerated = await generateEnvTest();
	if (!envGenerated) {
		process.exit(1);
	}

	const testsPassed = await runTests();
	process.exit(testsPassed ? 0 : 1);
}

main();
