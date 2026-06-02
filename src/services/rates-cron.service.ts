import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExchangeRateService } from './exchange-rate.service';
import { RatesStorageService } from './rates-storage.service';

@Injectable()
export class RatesCronService {
    private readonly logger = new Logger(RatesCronService.name);

    constructor(
        private readonly exchangeRateService: ExchangeRateService,
        private readonly storageService: RatesStorageService,
    ) { }

    @Cron('*/15 * * * 1-5')
    async handleCron(): Promise<void> {
        if (!this.isWithinVetWindow()) {
            return;
        }

        this.logger.log('Ventana VET activa, consultando BCV...');

        try {
            const result = await this.exchangeRateService.fetchAllRates();
            if (!result || !result.date) {
                this.logger.warn('No se pudo extraer la fecha del BCV');
                return;
            }

            if (!this.storageService.isNewDate(result.date)) {
                this.logger.log(`Fecha Valor sin cambios (${result.date}), saltando`);
                return;
            }

            const { saved, notice } = this.storageService.updateRates(result.date, result.rates);
            if (saved) {
                this.logger.log(`Nuevas tasas guardadas para ${result.date}`);
                if (notice) {
                    this.logger.warn(notice);
                }
            }
        } catch (error) {
            this.logger.error('Error en cron de BCV', error);
        }
    }

    private isWithinVetWindow(): boolean {
        const now = new Date();
        const vetTime = new Date(now.getTime() - 4 * 3600000);
        const hour = vetTime.getUTCHours();
        const minute = vetTime.getUTCMinutes();
        const totalMin = hour * 60 + minute;

        return totalMin >= 16 * 60 + 30 && totalMin < 18 * 60;
    }
}
