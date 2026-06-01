import { SetMetadata } from '@nestjs/common';

export const ValidPermission = (permission: string) => {
	return SetMetadata('valid-permission', permission);
};
