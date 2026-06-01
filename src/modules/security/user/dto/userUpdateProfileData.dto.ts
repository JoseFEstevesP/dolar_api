import { PickType } from '@nestjs/mapped-types';
import { UserRegisterDTO } from './userRegister.dto';

export class UserUpdateProfileDataDTO extends PickType(UserRegisterDTO, [
	'names',
	'surnames',
	'phone',
]) {}
