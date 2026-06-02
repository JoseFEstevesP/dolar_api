import { Controller, Get } from '@nestjs/common';
import * as os from 'os';

@Controller('health')
export class HealthController {
	@Get()
	async check() {
		const cpuLoad = os.loadavg()[0] / os.cpus().length;
		const totalMemory = os.totalmem();
		const freeMemory = os.freemem();
		const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

		return {
			status: 'ok',
			uptime: process.uptime(),
			timestamp: new Date().toISOString(),
			system: {
				cpu: Math.round(cpuLoad * 100) / 100,
				memory: Math.round(memoryUsage * 100) / 100,
			},
		};
	}
}
