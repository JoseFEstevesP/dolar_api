import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtener el nombre de la migración del argumento de línea de comandos
const migrationName = process.argv[2];

if (!migrationName) {
	console.error('Por favor, proporciona un nombre para la migración');
	process.exit(1);
}

// Generar el nombre del archivo con timestamp
const timestamp = new Date()
	.toISOString()
	.replace(/[-:]/g, '')
	.replace('T', '')
	.split('.')[0];
const fileName = `${timestamp}-${migrationName}.js`;
const migrationsDir = path.resolve(__dirname, '../src/migrations');
const filePath = path.join(migrationsDir, fileName);

// Crear el contenido de la migración ESM
const migrationContent = `/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
`;

// Escribir el archivo
fs.writeFileSync(filePath, migrationContent);

console.log(`Migración ESM creada: ${filePath}`);
