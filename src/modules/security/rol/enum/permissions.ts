const primaryPermissions = {
	super: 'SUPER',
	user: 'USER',
	rol: 'ROL',
	audit: 'AUDIT',
	dashboard: 'DASHBOARD',
} as const;

const Permission = {
	/* Super usuario */
	super: primaryPermissions.super,

	/* Usuario */
	user: primaryPermissions.user,
	userProfile: `${primaryPermissions.user}_PROFILE`,
	userAdd: `${primaryPermissions.user}_ADD`,
	userRead: `${primaryPermissions.user}_READ`,
	userReadOne: `${primaryPermissions.user}_READ_ONE`,
	userUpdate: `${primaryPermissions.user}_UPDATE`,
	userDelete: `${primaryPermissions.user}_DELETE`,

	/* Roles */
	rol: primaryPermissions.rol,
	rolAdd: `${primaryPermissions.rol}_ADD`,
	rolRead: `${primaryPermissions.rol}_READ`,
	rolReadOne: `${primaryPermissions.rol}_READ_ONE`,
	rolUpdate: `${primaryPermissions.rol}_UPDATE`,
	rolDelete: `${primaryPermissions.rol}_DELETE`,

	/* Auditoría */
	audit: primaryPermissions.audit,
	auditRead: `${primaryPermissions.audit}_READ`,
	auditDelete: `${primaryPermissions.audit}_DELETE`,

	/* Dashboard */
	dashboard: primaryPermissions.dashboard,
	dashboardRead: `${primaryPermissions.dashboard}_DASHBOARD`,
} as const;

type Permission = (typeof Permission)[keyof typeof Permission];

export { Permission };
