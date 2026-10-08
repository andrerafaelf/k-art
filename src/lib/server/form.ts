import { fail } from '@sveltejs/kit';
import type { L } from '#lib/content.ts';

/**
 * Reads and validates a submitted admin form. Problems are collected per field
 * so the form can show them all at once, next to the inputs they belong to.
 */
export class FormReader {
	errors: Record<string, string> = {};

	constructor(private data: FormData) {}

	private raw(name: string) {
		return String(this.data.get(name) ?? '').trim();
	}

	text(name: string, { required = false, max = 200 } = {}) {
		const value = this.raw(name);
		if (required && !value) this.errors[name] = 'Required';
		else if (value.length > max) this.errors[name] = `Keep this under ${max} characters`;
		return value;
	}

	/** Portuguese and English versions of a field. Portuguese is the main language, so only it can be required. */
	l(name: string, { required = false, max = 200 } = {}): L {
		return {
			pt: this.text(`${name}.pt`, { required, max }),
			en: this.text(`${name}.en`, { max })
		};
	}

	/** A textarea read as one entry per line, in both languages. */
	lines(name: string, { required = false, maxLines = 5, max = 40 } = {}): L<string[]> {
		const read = (lang: 'pt' | 'en') => {
			const key = `${name}.${lang}`;
			const lines = this.raw(key)
				.split('\n')
				.map((l) => l.trim())
				.filter(Boolean);
			if (lang === 'pt' && required && !lines.length) this.errors[key] = 'Required';
			else if (lines.length > maxLines) this.errors[key] = `Use at most ${maxLines} lines`;
			else if (lines.some((l) => l.length > max)) this.errors[key] = `Keep each line under ${max} characters`;
			return lines;
		};
		return { pt: read('pt'), en: read('en') };
	}

	int(name: string, { min = 0, max = 9999, required = true } = {}) {
		const value = this.raw(name);
		if (!value && !required) return min;
		const n = Number(value);
		if (!value) this.errors[name] = 'Required';
		else if (!Number.isInteger(n)) this.errors[name] = 'Use a whole number';
		else if (n < min || n > max) this.errors[name] = `Between ${min} and ${max}`;
		return Number.isInteger(n) ? n : min;
	}

	date(name: string) {
		const value = this.raw(name);
		if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
			this.errors[name] = 'Pick a date';
		}
		return value;
	}

	choice<T extends string>(name: string, options: readonly T[], fallback: T): T {
		const value = this.raw(name) as T;
		return options.includes(value) ? value : fallback;
	}

	bool(name: string) {
		return this.data.get(name) === 'on';
	}

	url(name: string) {
		const value = this.raw(name);
		if (!value) return undefined;
		const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
		try {
			const url = new URL(withScheme);
			if (!url.hostname.includes('.')) throw new Error();
			return url.href;
		} catch {
			this.errors[name] = 'Use a full web address, like https://example.com';
			return undefined;
		}
	}

	email(name: string) {
		const value = this.raw(name);
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) this.errors[name] = 'Use a valid email address';
		return value;
	}

	file(name: string) {
		const value = this.data.get(name);
		return value instanceof File && value.size > 0 ? value : undefined;
	}

	error(name: string, message: string) {
		this.errors[name] = message;
	}

	get ok() {
		return Object.keys(this.errors).length === 0;
	}

	fail() {
		return fail(400, { errors: this.errors, message: 'Some fields need attention.' });
	}
}
