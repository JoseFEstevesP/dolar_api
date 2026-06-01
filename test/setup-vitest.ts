import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'node:fs';

const envPath = resolve(process.cwd(), '.env.test');
if (existsSync(envPath)) {
	config({ path: envPath });
} else {
	config();
}
