import { validatePermission } from '@/functions/validatePermissions';
import { globalMsg } from '@/globalMsg';
import { Role } from '@/modules/security/rol/entities/rol.entity';

export const validateMiddleware = async ({
	uidRol,
	permission,
}: {
	uidRol: string;
	permission: string;
}) => {
	const validate = await Role.findOne({ where: { uid: uidRol } });

	if (
		!validatePermission({
			permissions: validate?.permissions || [],
			permission,
		})
	) {
		return { errors: [{ error: [{ error: globalMsg.userUnauthorized }] }] };
	}
};
