import { format } from '@formkit/tempo';

export const dateFormate = (date: string | Date, formate?: string) => {
	const dateFormat = formate ? formate : 'DD/MM/YYYY';
	const raw = format(date, dateFormat);
	return raw
		.replace(/\u00A0/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
};
