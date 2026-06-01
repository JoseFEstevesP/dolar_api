import { Injectable } from '@nestjs/common';

export interface Metric {
	name: string;
	labels: Record<string, string>;
	value: number;
	timestamp: number;
}

export interface CounterMetric extends Metric {
	type: 'counter';
}

export interface GaugeMetric extends Metric {
	type: 'gauge';
}

export interface HistogramMetric extends Metric {
	type: 'histogram';
	buckets: number[];
}

@Injectable()
export class MetricsService {
	private counters: Map<string, number> = new Map();
	private gauges: Map<string, number> = new Map();
	private histograms: Map<
		string,
		{ values: number[]; count: number; sum: number }
	> = new Map();

	private getKey(name: string, labels: Record<string, string>): string {
		const labelStr = Object.entries(labels)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([k, v]) => `${k}:${v}`)
			.join(',');
		return `${name}{${labelStr}}`;
	}

	increment(
		name: string,
		labels: Record<string, string> = {},
		value: number = 1,
	): void {
		const key = this.getKey(name, labels);
		const current = this.counters.get(key) || 0;
		this.counters.set(key, current + value);
	}

	decrement(
		name: string,
		labels: Record<string, string> = {},
		value: number = 1,
	): void {
		const key = this.getKey(name, labels);
		const current = this.counters.get(key) || 0;
		this.counters.set(key, current - value);
	}

	gauge(
		name: string,
		value: number,
		labels: Record<string, string> = {},
	): void {
		const key = this.getKey(name, labels);
		this.gauges.set(key, value);
	}

	histogram(
		name: string,
		value: number,
		labels: Record<string, string> = {},
	): void {
		const key = this.getKey(name, labels);
		const hist = this.histograms.get(key) || { values: [], count: 0, sum: 0 };
		hist.values.push(value);
		hist.count += 1;
		hist.sum += value;
		this.histograms.set(key, hist);
	}

	getCounters(): Record<string, number> {
		return Object.fromEntries(this.counters);
	}

	getGauges(): Record<string, number> {
		return Object.fromEntries(this.gauges);
	}

	getHistograms(): Record<
		string,
		{
			count: number;
			sum: number;
			avg: number;
			p50: number;
			p95: number;
			p99: number;
		}
	> {
		const result: Record<
			string,
			{
				count: number;
				sum: number;
				avg: number;
				p50: number;
				p95: number;
				p99: number;
			}
		> = {};

		for (const [key, hist] of this.histograms.entries()) {
			const sorted = [...hist.values].sort((a, b) => a - b);
			const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
			const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
			const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;

			result[key] = {
				count: hist.count,
				sum: hist.sum,
				avg: hist.sum / hist.count || 0,
				p50,
				p95,
				p99,
			};
		}

		return result;
	}

	getAllMetrics(): {
		counters: Record<string, number>;
		gauges: Record<string, number>;
		histograms: Record<
			string,
			{
				count: number;
				sum: number;
				avg: number;
				p50: number;
				p95: number;
				p99: number;
			}
		>;
	} {
		return {
			counters: this.getCounters(),
			gauges: this.getGauges(),
			histograms: this.getHistograms(),
		};
	}

	reset(): void {
		this.counters.clear();
		this.gauges.clear();
		this.histograms.clear();
	}
}
