import { Injectable, Logger } from '@nestjs/common';
import { get } from 'https';
import { StoredRates } from './rates-storage.service';

interface RateEntry {
    rate: number;
    timestamp: number;
}

interface FetchAllResult {
    date: string;
    rates: StoredRates;
}

const CURRENCIES = ['dolar', 'euro', 'yuan', 'lira', 'rublo'] as const;
const CURRENCY_MAP: Record<string, string> = {
    usd: 'dolar',
    eur: 'euro',
    cny: 'yuan',
    try: 'lira',
    rub: 'rublo',
};

@Injectable()
export class ExchangeRateService {
    private readonly logger = new Logger(ExchangeRateService.name);
    private readonly BCV_URL = 'https://www.bcv.org.ve';
    private readonly CACHE_TTL_MS = 30 * 60 * 1000;
    private cache: RateEntry | null = null;

    async getCurrentExchangeRate(): Promise<number> {
        if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL_MS) {
            return this.cache.rate;
        }

        try {
            const all = await this.fetchAllRates();
            const rate = all.rates.usd;
            if (!rate) throw new Error('USD rate not found');
            this.cache = { rate, timestamp: Date.now() };
            return rate;
        } catch (error) {
            if (this.cache) {
                this.logger.warn('BCV falló, usando caché expirada', error);
                return this.cache.rate;
            }
            throw new Error('No se pudo obtener la tasa de cambio de ninguna fuente');
        }
    }

    async fetchFromBCV(): Promise<number> {
        const all = await this.fetchAllRates();
        if (!all.rates.usd) throw new Error('Could not extract dollar value');
        return all.rates.usd;
    }

    async fetchAllRates(): Promise<FetchAllResult> {
        const html = await this.httpGet(this.BCV_URL);
        const date = this.extractDate(html);
        if (!date) throw new Error('Could not extract Fecha Valor from BCV');

        const rates: StoredRates = {};
        for (const id of CURRENCIES) {
            const match = this.extractRate(html, id);
            if (match !== null) {
                const key = this.keyFromId(id);
                rates[key] = match;
            }
        }

        if (Object.keys(rates).length === 0) {
            throw new Error('No exchange rates could be extracted');
        }

        return { date, rates };
    }

    async getRate(currency: string): Promise<{ date: string; rate: number } | null> {
        const all = await this.fetchAllRates();
        const key = currency.toLowerCase();
        const rate = all.rates[key];
        if (!rate) return null;
        return { date: all.date, rate };
    }

    convert(from: string, to: string, amount: number, rates: StoredRates): number | null {
        const fromKey = from.toLowerCase();
        const toKey = to.toLowerCase();
        const fromRate = rates[fromKey];
        const toRate = rates[toKey];
        if (!fromRate || !toRate) return null;
        const inVes = amount * fromRate;
        return inVes / toRate;
    }

    private httpGet(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                rejectUnauthorized: false,
            }, res => {
                if (res.statusCode && res.statusCode >= 400) {
                    reject(new Error(`HTTP ${res.statusCode}`));
                    return;
                }
                const chunks: string[] = [];
                res.setEncoding('utf8');
                res.on('data', (chunk: string) => chunks.push(chunk));
                res.on('end', () => resolve(chunks.join('')));
            }).on('error', reject);
        });
    }

    private extractDollarValue(html: string): number | null {
        return this.extractRate(html, 'dolar');
    }

    private extractRate(html: string, id: string): number | null {
        const regex = new RegExp(
            `id="${id}"[^>]*>[\\s\\S]*?<strong[^>]*>\\s*([\\d.,]+)\\s*<\\/strong>`,
            'i',
        );
        const match = html.match(regex);
        if (match && match[1]) {
            const cleaned = match[1].replace(/\./g, '').replace(',', '.');
            const rate = parseFloat(cleaned);
            if (rate > 0 && rate < 100000) return rate;
        }
        return null;
    }

    private extractDate(html: string): string | null {
        const match = html.match(
            /<span[^>]*class="date-display-single"[^>]*content="(\d{4}-\d{2}-\d{2})/i,
        );
        if (match && match[1]) return match[1];
        return null;
    }

    private keyFromId(id: string): string {
        for (const [key, val] of Object.entries(CURRENCY_MAP)) {
            if (val === id) return key;
        }
        return id;
    }
}
