import { Permission } from '@/modules/security/rol/enum/permissions';

export const validatePermission = ({
	permissions,
	permission,
}: {
	permissions: string[];
	permission: string;
}) => {
	const validate = permissions.some(
		item => item === permission || item === Permission.super,
	);
	return validate;
};
