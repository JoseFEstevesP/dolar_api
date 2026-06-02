import { ExchangeRateService } from '@/services/exchange-rate.service';
import {
    Controller,
    Get,
    Logger,
    NotFoundException,
    Param,
    Query,
    ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RatesStorageService } from '@/services/rates-storage.service';
import { exchangeRateMessages } from './exchange-rate.messages';

export const SUPPORTED_CURRENCIES = ['usd', 'eur', 'cny', 'try', 'rub'] as const;

@ApiTags('ExchangeRate')
@Controller('exchange-rate')
export class ExchangeRateController {
    private readonly logger = new Logger(ExchangeRateController.name);

    constructor(
        private readonly exchangeRateService: ExchangeRateService,
        private readonly storageService: RatesStorageService,
    ) { }

    @ApiResponse({ status: 200, description: 'Tasas de cambio actuales obtenidas correctamente' })
    @ApiResponse({ status: 503, description: exchangeRateMessages.error.bcvSourceUnavailable })
    @ApiOperation({ summary: 'Obtener todas las tasas de cambio actuales' })
    @Get('/current')
    async getCurrentRates() {
        this.logger.log(exchangeRateMessages.log.controller.current);
        const stored = this.storageService.getCurrent();
        const lastDate = this.storageService.getLastDate();

        if (stored && lastDate) {
            return { date: lastDate, rates: stored };
        }

        try {
            const result = await this.exchangeRateService.fetchAllRates();
            this.storageService.updateRates(result.date, result.rates);
            return { date: result.date, rates: result.rates };
        } catch {
            throw new ServiceUnavailableException(exchangeRateMessages.error.bcvSourceUnavailable);
        }
    }

    @ApiResponse({ status: 200, description: 'Tasa de cambio para la moneda obtenida correctamente' })
    @ApiResponse({ status: 404, description: exchangeRateMessages.error.currencyNotFound })
    @ApiResponse({ status: 503, description: exchangeRateMessages.error.bcvSourceUnavailable })
    @ApiParam({ name: 'currency', description: 'Código de moneda (usd, eur, cny, try, rub)' })
    @ApiOperation({ summary: 'Obtener tasa de cambio para una moneda específica' })
    @Get('/current/:currency')
    async getCurrencyRate(@Param('currency') currency: string) {
        this.logger.log(`${exchangeRateMessages.log.controller.currentCurrency}: ${currency}`);
        const key = currency.toLowerCase();

        if (!SUPPORTED_CURRENCIES.includes(key as any)) {
            throw new NotFoundException(exchangeRateMessages.error.currencyNotFound);
        }

        const stored = this.storageService.getCurrent();
        const lastDate = this.storageService.getLastDate();

        if (stored && lastDate && stored[key as keyof typeof stored]) {
            return { date: lastDate, currency: key, rate: stored[key as keyof typeof stored] };
        }

        try {
            const rate = await this.exchangeRateService.getRate(key);
            if (rate) return { date: rate.date, currency: key, rate: rate.rate };
            throw new NotFoundException(exchangeRateMessages.error.currencyNotFound);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new ServiceUnavailableException(exchangeRateMessages.error.bcvSourceUnavailable);
        }
    }

    @ApiResponse({ status: 200, description: 'Tasas para la fecha obtenidas correctamente' })
    @ApiResponse({ status: 404, description: exchangeRateMessages.error.dateNotFound })
    @ApiParam({ name: 'date', description: 'Fecha en formato YYYY-MM-DD' })
    @ApiOperation({ summary: 'Obtener tasas para una fecha específica del historial' })
    @Get('/date/:date')
    async getRatesByDate(@Param('date') date: string) {
        this.logger.log(`${exchangeRateMessages.log.controller.date}: ${date}`);
        const entry = this.storageService.getByDate(date);
        if (!entry) {
            throw new NotFoundException(exchangeRateMessages.error.dateNotFound);
        }
        return { date: entry.date, rates: entry.rates, updatedAt: entry.updatedAt };
    }

    @ApiResponse({ status: 200, description: 'Historial obtenido correctamente' })
    @ApiResponse({ status: 404, description: exchangeRateMessages.error.historyEmpty })
    @ApiOperation({ summary: 'Obtener historial completo de tasas de cambio' })
    @Get('/history')
    async getHistory() {
        this.logger.log(exchangeRateMessages.log.controller.history);
        const { history, notice } = this.storageService.getHistory();
        if (history.length === 0) {
            throw new NotFoundException(exchangeRateMessages.error.historyEmpty);
        }
        return {
            count: history.length,
            history,
            ...(notice ? { notice } : {}),
        };
    }

    @ApiResponse({ status: 200, description: exchangeRateMessages.success.convert })
    @ApiResponse({ status: 404, description: exchangeRateMessages.error.convertNoRate })
    @ApiQuery({ name: 'from', description: 'Moneda de origen (usd, eur, cny, try, rub, ves)' })
    @ApiQuery({ name: 'to', description: 'Moneda de destino (usd, eur, cny, try, rub, ves)' })
    @ApiQuery({ name: 'amount', description: 'Monto a convertir' })
    @ApiOperation({ summary: 'Convertir entre monedas usando VES como puente' })
    @Get('/convert')
    async convert(
        @Query('from') from: string,
        @Query('to') to: string,
        @Query('amount') amount: string,
    ) {
        this.logger.log(`${exchangeRateMessages.log.controller.convert}: ${from} → ${to}`);
        const fromKey = from.toLowerCase();
        const toKey = to.toLowerCase();
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            throw new NotFoundException('Monto inválido');
        }

        const stored = this.storageService.getCurrent();
        const lastDate = this.storageService.getLastDate();
        let rates = stored;
        let date = lastDate;

        if (!rates || !date) {
            try {
                const result = await this.exchangeRateService.fetchAllRates();
                this.storageService.updateRates(result.date, result.rates);
                rates = result.rates;
                date = result.date;
            } catch {
                throw new ServiceUnavailableException(exchangeRateMessages.error.bcvSourceUnavailable);
            }
        }

        let result: number | null;

        if (fromKey === 'ves') {
            const toRate = rates[toKey as keyof typeof rates];
            if (!toRate) throw new NotFoundException(exchangeRateMessages.error.convertNoRate);
            result = parsedAmount / toRate;
        } else if (toKey === 'ves') {
            const fromRate = rates[fromKey as keyof typeof rates];
            if (!fromRate) throw new NotFoundException(exchangeRateMessages.error.convertNoRate);
            result = parsedAmount * fromRate;
        } else {
            result = this.exchangeRateService.convert(fromKey, toKey, parsedAmount, rates);
        }

        if (result === null) {
            throw new NotFoundException(exchangeRateMessages.error.convertNoRate);
        }

        return {
            from: fromKey,
            to: toKey,
            amount: parsedAmount,
            result: parseFloat(result.toFixed(6)),
            rate: rates[toKey as keyof typeof rates] ?? null,
            date,
        };
    }

    @ApiResponse({ status: 200, description: 'Información de última actualización' })
    @ApiOperation({ summary: 'Obtener información de la última actualización' })
    @Get('/last-update')
    async getLastUpdate() {
        this.logger.log(exchangeRateMessages.log.controller.lastUpdate);
        const lastDate = this.storageService.getLastDate();
        const updatedAt = this.storageService.getUpdatedAt();
        const current = this.storageService.getCurrent();

        return {
            lastDate,
            updatedAt,
            hasRates: current !== null && lastDate !== null,
            currencies: current ? Object.keys(current) : [],
        };
    }
}
