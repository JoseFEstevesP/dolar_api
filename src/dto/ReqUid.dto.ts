import { IsObject } from 'class-validator';

export class ReqUidDTO {
	@IsObject({ message: 'El objeto no es valido' })
	declare user: {
		uid: string;
		uidRol: string;
		uidPharmacy: string | null;
		dataLog: string;
	};
}
