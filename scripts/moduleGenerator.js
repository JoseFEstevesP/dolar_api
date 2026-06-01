import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEMPLATES } from './templates.js';

// Configuración
const CONFIG = {
	modulesDirectory: './src/modules',
	migrationsDirectory: './src/migrations',
	permissionsFile: './src/modules/security/rol/enum/permissions.ts',
};

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para capitalizar la primera letra
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para crear directorios recursivamente
function createDirectories(basePath, directories) {
	directories.forEach(dir => {
		const dirPath = path.join(basePath, dir);
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true });
			console.log(`✓ Directorio creado: ${dirPath}`);
		}
	});
}

// Función para crear archivos con contenido
function createFile(filePath, content) {
	const dirPath = path.dirname(filePath);
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}

	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, content);
		console.log(`✓ Archivo creado: ${filePath}`);
	}
}

// Función para actualizar el archivo de permisos global (UNICA versión corregida)
function updatePermissionsFile(moduleName) {
	try {
		const permissionsPath = path.resolve(CONFIG.permissionsFile);
		if (!fs.existsSync(permissionsPath)) {
			console.log(
				`⚠️  Archivo de permisos no encontrado en: ${permissionsPath}`,
			);
			return;
		}

		let content = fs.readFileSync(permissionsPath, 'utf8');
		const moduleUpper = moduleName.toUpperCase();
		const moduleKey = moduleName; // ej: 'system'

		// Verificar si el módulo ya está en primaryPermissions
		const primaryRegex = new RegExp(`${moduleKey}:\\s*'${moduleUpper}',?`);
		if (primaryRegex.test(content)) {
			console.log('✓ Permisos ya existen en el archivo');
			return;
		}

		// ========== 1. Agregar a primaryPermissions ==========
		const primaryPermStart = content.indexOf('const primaryPermissions = {');
		if (primaryPermStart === -1) {
			console.log('⚠️  No se encontró "const primaryPermissions = {"');
			return;
		}

		// Encontrar el cierre de primaryPermissions
		let braceCount = 1;
		let idx = primaryPermStart + 'const primaryPermissions = {'.length;
		while (braceCount > 0 && idx < content.length) {
			if (content[idx] === '{') braceCount++;
			if (content[idx] === '}') braceCount--;
			idx++;
		}
		const primaryEndBrace = idx - 1; // posición de '}'

		const beforePrimaryClose = content.slice(0, primaryEndBrace);
		const afterPrimaryClose = content.slice(primaryEndBrace);

		// Verificar si necesita coma antes de insertar
		const trimmedBefore = beforePrimaryClose.trim();
		const needsComma = !trimmedBefore.endsWith(',');
		const newPrimaryEntry = needsComma
			? `\n\t${moduleKey}: '${moduleUpper}',`
			: `\n\t${moduleKey}: '${moduleUpper}',`;

		const newPrimaryContent =
			beforePrimaryClose + newPrimaryEntry + afterPrimaryClose;
		content = newPrimaryContent;

		// ========== 2. Agregar al objeto Permission ==========
		// Buscar el objeto Permission después de la modificación anterior
		const permissionObjStart = content.indexOf('const Permission = {');
		if (permissionObjStart === -1) {
			console.log('⚠️  No se encontró "const Permission = {"');
			return;
		}

		braceCount = 1;
		idx = permissionObjStart + 'const Permission = {'.length;
		while (braceCount > 0 && idx < content.length) {
			if (content[idx] === '{') braceCount++;
			if (content[idx] === '}') braceCount--;
			idx++;
		}
		const permissionEndBrace = idx - 1;

		const beforePermissionClose = content.slice(0, permissionEndBrace);
		const afterPermissionClose = content.slice(permissionEndBrace);

		// Generar las líneas de permisos usando primaryPermissions
		const modulePermissions = `
	/* ${capitalizeFirstLetter(moduleName)} */
	${moduleKey}: primaryPermissions.${moduleKey},
	${moduleKey}Add: \`\${primaryPermissions.${moduleKey}}_ADD\`,
	${moduleKey}Read: \`\${primaryPermissions.${moduleKey}}_READ\`,
	${moduleKey}ReadOne: \`\${primaryPermissions.${moduleKey}}_READ_ONE\`,
	${moduleKey}Update: \`\${primaryPermissions.${moduleKey}}_UPDATE\`,
	${moduleKey}Delete: \`\${primaryPermissions.${moduleKey}}_DELETE\`,`;

		// Verificar si la última línea antes del cierre ya tiene coma
		const lastLineBefore = beforePermissionClose.trim();
		const lastChar = lastLineBefore[lastLineBefore.length - 1];
		let insertText = modulePermissions;
		if (lastChar !== ',') {
			insertText = ',\n' + insertText;
		} else {
			insertText = '\n' + insertText;
		}
		insertText = insertText + '\n';

		const newContent =
			beforePermissionClose + insertText + afterPermissionClose;
		fs.writeFileSync(permissionsPath, newContent);
		console.log(
			'✓ Permisos agregados siguiendo la estructura primaryPermissions',
		);
	} catch (error) {
		console.error('⚠️  Error al actualizar permisos:', error.message);
	}
}

// Función para actualizar el archivo de app.module.ts
function updateAppModule(moduleName) {
	try {
		const capitalizedName = capitalizeFirstLetter(moduleName);
		const appModulePath = path.resolve('./src/app.module.ts');

		if (!fs.existsSync(appModulePath)) {
			console.log(
				`⚠️  Archivo app.module.ts no encontrado en: ${appModulePath}`,
			);
			return;
		}

		let content = fs.readFileSync(appModulePath, 'utf8');

		// Verificar si el módulo ya está importado
		if (
			content.includes(`from './modules/${moduleName}/${moduleName}.module'`)
		) {
			console.log('✓ Módulo ya existe en app.module.ts');
			return;
		}

		// 1. AGREGAR IMPORTACIÓN - Después de la última importación existente
		const lastImportRegex = /import.*from.*;\s*\n(?!\s*import)/;
		const lastImportMatch = content.match(lastImportRegex);

		if (lastImportMatch) {
			const lastImportIndex =
				content.lastIndexOf(lastImportMatch[0]) + lastImportMatch[0].length;
			const newImport = `import { ${capitalizedName}Module } from './modules/${moduleName}/${moduleName}.module';\n`;
			content =
				content.slice(0, lastImportIndex) +
				newImport +
				content.slice(lastImportIndex);
		}

		// 2. AGREGAR AL ARRAY DE IMPORTS - Buscar el patrón exacto: "AuthModule," con su nueva línea
		const authModulePattern = /AuthModule,\s*\n/;
		const authModuleMatch = content.match(authModulePattern);

		if (authModuleMatch) {
			const authModuleIndex =
				content.indexOf(authModuleMatch[0]) + authModuleMatch[0].length;
			const indentMatch = authModuleMatch[0].match(/\n(\s*)AuthModule/);
			const indent = indentMatch ? indentMatch[1] : '\t\t';
			const newModule = `${indent}${capitalizedName}Module,\n`;
			content =
				content.slice(0, authModuleIndex) +
				newModule +
				content.slice(authModuleIndex);
		} else {
			// Fallback: buscar el cierre del array de imports
			const importsEndPattern = /,\s*\n\s*\]\s*,/;
			const importsEndMatch = content.match(importsEndPattern);
			if (importsEndMatch) {
				const importsEndIndex = content.indexOf(importsEndMatch[0]);
				const newModule = `\t\t${capitalizedName}Module,\n`;
				content =
					content.slice(0, importsEndIndex) +
					newModule +
					content.slice(importsEndIndex);
			}
		}

		fs.writeFileSync(appModulePath, content);
		console.log('✓ Módulo agregado correctamente a app.module.ts');
	} catch (error) {
		console.error('⚠️  Error al actualizar app.module.ts:', error.message);
	}
}

// Función para crear migración automáticamente
function createMigration(moduleName) {
	try {
		const capitalizedName = capitalizeFirstLetter(moduleName);
		const tableName = `${capitalizedName}s`;
		const migrationName = `create-${moduleName}`;

		console.log(`\nGenerando migración para: ${tableName}`);

		// Ejecutar el comando para crear la migración
		execSync(`pnpm migrate:create ${migrationName}`, {
			stdio: 'inherit',
			cwd: path.resolve(__dirname, '..'),
		});

		console.log('✓ Migración creada exitosamente');

		// Encontrar el archivo de migración más reciente
		const migrationFiles = fs
			.readdirSync(CONFIG.migrationsDirectory)
			.filter(file => file.endsWith('.js') && file.includes(migrationName))
			.sort()
			.reverse();

		if (migrationFiles.length > 0) {
			const latestMigration = migrationFiles[0];
			const migrationPath = path.join(
				CONFIG.migrationsDirectory,
				latestMigration,
			);

			// Contenido de la migración
			const migrationContent = `
/** @type {import('sequelize-cli').Migration} */
export default {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('${tableName}', {
			uid: {
				type: Sequelize.UUID,
				primaryKey: true,
				unique: true,
				allowNull: false,
				defaultValue: Sequelize.UUIDV4,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			uidUser: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'users',
					key: 'uid',
				},
				onUpdate: 'CASCADE',
				onDelete: 'RESTRICT',
			},
			status: {
				type: Sequelize.BOOLEAN,
				defaultValue: true,
				allowNull: false,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW'),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW'),
			},
		}, {
			indexes: [
				{ unique: true, fields: ['name'], name: 'idx_${moduleName}_name' },
				{ fields: ['uidUser'], name: 'idx_${moduleName}_uid_user' },
				{ fields: ['status'], name: 'idx_${moduleName}_status' },
				{ fields: ['status', 'uidUser'], name: 'idx_${moduleName}_status_user' },
			],
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('${tableName}');
	},
};
`;
			fs.writeFileSync(migrationPath, migrationContent);
			console.log(
				`✓ Contenido de migración actualizado en: ${latestMigration}`,
			);
		}
	} catch (error) {
		console.log(
			'⚠️  No se pudo generar la migración automáticamente.',
			error.message,
		);
		console.log('💡 Ejecuta manualmente:');
		console.log(`pnpm migrate:create create-${moduleName}`);
		console.log('Y luego actualiza el contenido del archivo de migración.');
	}
}

// Función principal para generar el módulo
function generateModule() {
	console.log('=== Generador de Módulos NestJS ===\n');

	const moduleName = process.argv[2];
	if (!moduleName) {
		console.error(
			'Error: Debes proporcionar el nombre del módulo como argumento.',
		);
		console.log('Uso: node moduleGenerator.js <nombre-del-módulo>');
		process.exit(1);
	}

	const capitalizedName = capitalizeFirstLetter(moduleName);
	const modulePath = path.resolve(CONFIG.modulesDirectory, moduleName);

	// Crear estructura de directorios
	const directories = ['', 'dto', 'entities', 'enum', 'repository', 'use-case'];
	createDirectories(modulePath, directories);

	// Crear archivos principales
	createFile(
		path.join(modulePath, `${moduleName}.d.ts`),
		TEMPLATES.types(moduleName),
	);
	createFile(
		path.join(modulePath, `${moduleName}.messages.ts`),
		TEMPLATES.messages(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, `${moduleName}.controller.ts`),
		TEMPLATES.controller(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, `${moduleName}.module.ts`),
		TEMPLATES.module(moduleName, capitalizedName),
	);

	// DTOs
	createFile(
		path.join(modulePath, 'dto', `${moduleName}GetAll.dto.ts`),
		TEMPLATES.dto.getAll(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, 'dto', `${moduleName}Register.dto.ts`),
		TEMPLATES.dto.register(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, 'dto', `${moduleName}Update.dto.ts`),
		TEMPLATES.dto.update(moduleName, capitalizedName),
	);

	// Entidad
	createFile(
		path.join(modulePath, 'entities', `${moduleName}.entity.ts`),
		TEMPLATES.entity(moduleName, capitalizedName),
	);

	// Enums
	createFile(
		path.join(modulePath, 'enum', 'orderProperty.ts'),
		TEMPLATES.enums.orderProperty(moduleName, capitalizedName),
	);

	// Repositorio
	createFile(
		path.join(modulePath, 'repository', `${moduleName}.repository.ts`),
		TEMPLATES.repository(moduleName, capitalizedName),
	);

	// Use cases
	createFile(
		path.join(modulePath, 'use-case', `create${capitalizedName}.use-case.ts`),
		TEMPLATES.useCases.create(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, 'use-case', `findAll${capitalizedName}s.use-case.ts`),
		TEMPLATES.useCases.findAll(moduleName, capitalizedName),
	);
	createFile(
		path.join(
			modulePath,
			'use-case',
			`findAll${capitalizedName}sPagination.use-case.ts`,
		),
		TEMPLATES.useCases.findAllPagination(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, 'use-case', `findOne${capitalizedName}.use-case.ts`),
		TEMPLATES.useCases.findOne(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, 'use-case', `remove${capitalizedName}.use-case.ts`),
		TEMPLATES.useCases.remove(moduleName, capitalizedName),
	);
	createFile(
		path.join(modulePath, 'use-case', `update${capitalizedName}.use-case.ts`),
		TEMPLATES.useCases.update(moduleName, capitalizedName),
	);

	// Actualizar permisos globales
	updatePermissionsFile(moduleName);

	// Crear migración
	createMigration(moduleName);

	// Actualizar app.module.ts
	updateAppModule(moduleName);

	console.log(
		`\n✓ Módulo "${moduleName}" generado exitosamente en: ${modulePath}`,
	);
	console.log(
		'\n⚠️  IMPORTANTE: Revisa y ajusta los archivos según las necesidades específicas de tu módulo.',
	);
}

// Ejecutar la generación del módulo
generateModule();
