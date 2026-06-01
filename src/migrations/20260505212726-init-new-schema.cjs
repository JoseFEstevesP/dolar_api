/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// 1. Create Roles table
		await queryInterface.createTable('roles', {
			uid: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
			name: { type: Sequelize.STRING(50), allowNull: false, unique: true },
			description: { type: Sequelize.STRING(200), allowNull: true },
			permissions: {
				type: Sequelize.ARRAY(Sequelize.TEXT),
				allowNull: false,
				defaultValue: [],
			},
			status: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
		});

		// 2. Create Users table
		await queryInterface.createTable('users', {
			uid: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
			names: { type: Sequelize.STRING(100), allowNull: false },
			surnames: { type: Sequelize.STRING(100), allowNull: false },
			email: { type: Sequelize.STRING(100), allowNull: false, unique: true },
			password: { type: Sequelize.STRING(255), allowNull: false },
			phone: { type: Sequelize.STRING(20), allowNull: true },
			code: { type: Sequelize.STRING(20), allowNull: true },
			avatar: { type: Sequelize.STRING(500), allowNull: true },
			provider: {
				type: Sequelize.STRING(50),
				allowNull: false,
				defaultValue: 'local',
			},
			status: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
			activatedAccount: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			attemptCount: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			dataOfAttempt: { type: Sequelize.DATE, allowNull: true },
			uidRol: {
				type: Sequelize.UUID,
				allowNull: false,
				references: { model: 'roles', key: 'uid' },
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
		});
		await queryInterface.addConstraint('users', {
			type: 'foreign key',
			fields: ['uidRol'],
			references: { table: 'roles', field: 'uid' },
		});

		// 3. Create Audit table
		await queryInterface.createTable('audit', {
			uid: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
			uidUser: {
				type: Sequelize.UUID,
				allowNull: false,
				references: { model: 'users', key: 'uid' },
			},
			refreshToken: { type: Sequelize.TEXT, allowNull: false },
			dataToken: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: false },
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
		});
		await queryInterface.addConstraint('audit', {
			type: 'foreign key',
			fields: ['uidUser'],
			references: { table: 'users', field: 'uid' },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('audit');
		await queryInterface.dropTable('users');
		await queryInterface.dropTable('roles');
	},
};
