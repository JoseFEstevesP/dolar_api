import { PayloadJWT } from '@/modules/security/auth/types';

declare module 'express' {
	interface Request {
		user?: PayloadJWT;
	}
}
