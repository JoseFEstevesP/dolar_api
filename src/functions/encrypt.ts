import { Buffer } from 'node:buffer';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function deriveKey(key: string): Buffer {
	return createHash('sha256').update(key).digest();
}

export function encrypt(text: string, key: string): string {
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, deriveKey(key), iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	const authTag = cipher.getAuthTag().toString('hex');
	return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string, key: string): string {
	const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
	const decipher = createDecipheriv(ALGORITHM, deriveKey(key), Buffer.from(ivHex, 'hex'));
	decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
	let decrypted = decipher.update(encrypted, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}
