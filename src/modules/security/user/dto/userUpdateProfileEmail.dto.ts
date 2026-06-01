import { PickType } from '@nestjs/mapped-types';
import { UserRegisterDTO } from './userRegister.dto';

export class UserUpdateProfileEmailDTO extends PickType(UserRegisterDTO, [
	'email',
	'password',
]) {}
