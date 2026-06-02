import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ExchangeRateService } from '@/services/exchange-rate.service';
import { RatesCronService } from '@/services/rates-cron.service';
import { RatesStorageService } from '@/services/rates-storage.service';
import { ExchangeRateController } from './exchange-rate.controller';

@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [ExchangeRateController],
    providers: [ExchangeRateService, RatesStorageService, RatesCronService],
    exports: [ExchangeRateService, RatesStorageService],
})
export class ExchangeRateModule {}
