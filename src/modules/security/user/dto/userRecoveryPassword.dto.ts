import { PickType } from '@nestjs/mapped-types';
import { UserRegisterDTO } from './userRegister.dto';

export class UserRecoveryPasswordDTO extends PickType(UserRegisterDTO, [
	'email',
]) {}
