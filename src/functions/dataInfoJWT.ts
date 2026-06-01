import { Logger } from '@nestjs/common';
import { Request } from 'express';
import { DataInfoJWT } from './dataInfoJWT.d';

const isPrivateIP = ({ ip }: { ip: string }): boolean => {
	return /^(::f{4}:)?10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|::1$|^fc00:/i.test(
		ip,
	);
};

export const dataInfoJWT = (req: Request): DataInfoJWT => {
	const logger = new Logger('dataInfoJWT');
	let ip = 'Unknown IP';

	const xForwardedFor = req.headers['x-forwarded-for'];
	if (xForwardedFor) {
		const ips = String(xForwardedFor)
			.split(',')
			.map(ipAddr => ipAddr.trim());
		ip = ips.find(ipAddr => !isPrivateIP({ ip: ipAddr })) || ips[0];
	} else if (req.headers['x-real-ip']) {
		ip = String(req.headers['x-real-ip']);
	} else {
		ip = req.socket?.remoteAddress || ip;
	}

	let userPlatform = 'Unknown Platform';
	const platformHeader = req.headers['sec-ch-ua-platform'];

	if (platformHeader && typeof platformHeader === 'string') {
		try {
			userPlatform = platformHeader.replace(/^"+|"+$/g, '');
		} catch (e) {
			logger.error('Error parsing platform header:', e);
		}
	}

	const data: DataInfoJWT = {
		ip,
		userAgent: req.headers['user-agent'] || 'Unknown User-Agent',
		userPlatform,
	};

	return data;
};
