import { JwtAuthGuard } from '@/modules/security/auth/guards/jwtAuth.guard';
import { Permission } from '@/modules/security/rol/enum/permissions';
import { ValidPermission } from '@/modules/security/valid-permission/validPermission.decorator';
import { PermissionsGuard } from '@/modules/security/valid-permission/validPermission.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export const Auth = (permission: Permission) =>
	applyDecorators(
		ApiBearerAuth(),
		UseGuards(JwtAuthGuard, PermissionsGuard),
		ValidPermission(permission),
	);

export const AuthPublic = () =>
	applyDecorators(
		ApiBearerAuth(),
		UseGuards(JwtAuthGuard, PermissionsGuard),
	);
