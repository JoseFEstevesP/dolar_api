import { Transaction } from 'sequelize';

export interface AuthUserData {
	uid: string;
	password: string | null;
	attemptCount: number;
	status: boolean;
	activatedAccount: boolean;
	uidRol: string;
	surnames: string;
	names: string;
	email: string;
	provider: string;
	rol?: { name: string; permissions: string[] };
}

export abstract class AuthUserGateway {
	abstract findByEmail(email: string): Promise<AuthUserData | null>;
	abstract findById(uid: string): Promise<AuthUserData | null>;
	abstract validateAttempts(uidUser: string): Promise<void>;
	abstract resetAttempts(uidUser: string, transaction?: Transaction): Promise<void>;
	abstract beginTransaction<T>(callback: (t: Transaction) => Promise<T>): Promise<T>;
}
