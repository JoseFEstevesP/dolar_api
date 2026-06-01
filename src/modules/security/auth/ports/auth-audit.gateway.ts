import { Transaction } from 'sequelize';

export interface AuthAuditData {
	uid: string;
	uidUser: string;
	refreshToken: string;
	dataToken: string[];
}

export abstract class AuthAuditGateway {
	abstract create(uidUser: string, refreshToken: string, dataToken: string[], transaction?: Transaction): Promise<void>;
	abstract findByRefreshToken(refreshToken: string, dataToken?: string[]): Promise<AuthAuditData | null>;
	abstract updateToken(uid: string, refreshToken: string): Promise<void>;
	abstract removeByUser(uidUser: string, dataLog: string): Promise<void>;
}
