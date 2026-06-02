import { Injectable, Logger } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface StoredRates {
    usd?: number;
    eur?: number;
    cny?: number;
    try?: number;
    rub?: number;
    [key: string]: number | undefined;
}

export interface HistoryEntry {
    date: string;
    rates: StoredRates;
    updatedAt: string;
}

interface StorageData {
    lastDate: string | null;
    current: StoredRates | null;
    updatedAt: string | null;
    history: HistoryEntry[];
    cleanupNotice?: string;
}

@Injectable()
export class RatesStorageService {
    private readonly logger = new Logger(RatesStorageService.name);
    private readonly dataPath = join(process.cwd(), 'data', 'rates.json');
    private data: StorageData = {
        lastDate: null,
        current: null,
        updatedAt: null,
        history: [],
    };
    private loaded = false;

    constructor() {
        this.load();
    }

    private load(): void {
        if (this.loaded) return;
        try {
            if (existsSync(this.dataPath)) {
                const raw = readFileSync(this.dataPath, 'utf8');
                this.data = JSON.parse(raw) as StorageData;
                this.logger.log(`Datos cargados desde ${this.dataPath}`);
            } else {
                this.logger.warn('No se encontró archivo de datos, iniciando vacío');
                this.data = {
                    lastDate: null,
                    current: null,
                    updatedAt: null,
                    history: [],
                };
            }
        } catch (error) {
            this.logger.error('Error cargando datos, iniciando vacío', error);
            this.data = {
                lastDate: null,
                current: null,
                updatedAt: null,
                history: [],
            };
        }
        this.loaded = true;
    }

    private save(): void {
        try {
            const dir = join(process.cwd(), 'data');
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }
            writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), 'utf8');
        } catch (error) {
            this.logger.error('Error guardando datos', error);
        }
    }

    getCurrent(): StoredRates | null {
        return this.data.current;
    }

    getLastDate(): string | null {
        return this.data.lastDate;
    }

    getUpdatedAt(): string | null {
        return this.data.updatedAt;
    }

    getHistory(): { history: HistoryEntry[]; notice?: string } {
        return {
            history: this.data.history,
            ...(this.data.cleanupNotice ? { notice: this.data.cleanupNotice } : {}),
        };
    }

    getByDate(date: string): HistoryEntry | undefined {
        return this.data.history.find(e => e.date === date);
    }

    isNewDate(date: string): boolean {
        return this.data.lastDate !== date;
    }

    updateRates(date: string, rates: StoredRates): { saved: boolean; notice?: string } {
        const now = new Date().toISOString();
        const entry: HistoryEntry = { date, rates, updatedAt: now };

        this.data.lastDate = date;
        this.data.current = rates;
        this.data.updatedAt = now;
        this.data.history.push(entry);

        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - 3);
        const cutoffStr = cutoff.toISOString().slice(0, 10);

        const before = this.data.history.length;
        this.data.history = this.data.history.filter(e => e.date >= cutoffStr);
        const removed = before - this.data.history.length;

        if (removed > 0) {
            const msg = `Registros anteriores a ${cutoffStr} fueron eliminados por rotación (${removed} entradas)`;
            this.data.cleanupNotice = msg;
            this.logger.warn(msg);
        } else {
            delete this.data.cleanupNotice;
        }

        this.save();

        return {
            saved: true,
            ...(this.data.cleanupNotice ? { notice: this.data.cleanupNotice } : {}),
        };
    }
}
