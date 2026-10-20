// The shop: categories, prices, stock and the visitor's list, shared by the
// site, the admin and the server. There are no payments: visitors put together
// a list, then download it as a PDF, send it to the team or send it on WhatsApp,
// and the team replies about payment and pickup.

import type { L, Lang, Product, ProductOption } from './content.ts';

// ---------- categories ----------

export const CATEGORIES = [
	'chassis',
	'engine',
	'tyres',
	'bodywork',
	'electronics',
	'gear',
	'tools',
	'karts',
	'merch',
	'other'
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_NAMES: Record<Category, L> = {
	chassis: { pt: 'Chassis e travões', en: 'Chassis & brakes' },
	engine: { pt: 'Motor e transmissão', en: 'Engine & drivetrain' },
	tyres: { pt: 'Pneus e jantes', en: 'Tyres & wheels' },
	bodywork: { pt: 'Carenagens', en: 'Bodywork' },
	electronics: { pt: 'Eletrónica e dados', en: 'Electronics & data' },
	gear: { pt: 'Equipamento do piloto', en: 'Driver gear' },
	tools: { pt: 'Ferramentas e oficina', en: 'Tools & workshop' },
	karts: { pt: 'Karts e motores completos', en: 'Complete karts & engines' },
	merch: { pt: 'Merchandising', en: 'Merchandise' },
	other: { pt: 'Outros', en: 'Other' }
};

export const categoryName = (id: string, lang: Lang) => (CATEGORY_NAMES[id as Category] ?? CATEGORY_NAMES.other)[lang];

/** Example products, loaded from the admin to try the shop with, have ids starting with this */
export const DEMO_PREFIX = 'demo-';
export const isDemo = (p: { id: string }) => p.id.startsWith(DEMO_PREFIX);

/** Offered in the admin as one-click "fits" tags; anything else can be typed */
export const FITS = ['OTK', 'Kosmic', 'CRG', 'Birel ART', 'Praga', 'Sodi', 'Rotax Max', 'IAME X30', 'KZ2', 'Mini', 'Cadete', 'Júnior', 'Sénior'];

/** Shown when a product has options but no name for them */
export const OPTION_NAME: L = { pt: 'Tamanho', en: 'Size' };

// ---------- prices ----------

// Prices are kept in cents and formatted by hand, so server and browser always agree

const group = (n: number, sep: string) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);

/** "1 234,50 €" / "€1,234.50" */
export function money(cents: number, lang: Lang) {
	const euros = Math.floor(Math.abs(cents) / 100);
	const rest = String(Math.abs(cents) % 100).padStart(2, '0');
	const sign = cents < 0 ? '-' : '';
	return lang === 'pt' ? `${sign}${group(euros, ' ')},${rest} €` : `${sign}€${group(euros, ',')}.${rest}`;
}

/**
 * Reads a price typed in the admin: "12,50", "12.5", "1.234,50", "€ 45".
 * Returns cents, undefined when empty, or NaN when it isn't a price.
 */
export function parseMoney(input: string): number | undefined {
	const s = input.replace(/[\s€ ]/g, '');
	if (!s) return undefined;
	if (!/^\d[\d.,]*$/.test(s)) return NaN;
	const last = Math.max(s.lastIndexOf(','), s.lastIndexOf('.'));
	// A separator followed by one or two digits is the decimal point; any other is a thousands separator
	const decimal = last >= 0 && s.length - last - 1 <= 2 ? last : -1;
	const whole = (decimal >= 0 ? s.slice(0, decimal) : s).replace(/[.,]/g, '');
	const cents = decimal >= 0 ? s.slice(decimal + 1).padEnd(2, '0') : '00';
	const value = Number(whole || '0') * 100 + Number(cents);
	return Number.isSafeInteger(value) ? value : NaN;
}

/** For the admin's price fields: "12,50" */
export const moneyInput = (cents: number | undefined) =>
	cents === undefined ? '' : `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, '0')}`;

// ---------- stock ----------

/** At or below this, the shop says "last units" */
export const LOW_STOCK = 2;
/** The most of one thing that can go on a list when it can be ordered in */
export const ORDER_MAX = 20;

export type StockState = 'in' | 'low' | 'out' | 'order';

export const optionOf = (p: Pick<Product, 'options'>, optionId: string | undefined) =>
	optionId ? p.options.find((o) => o.id === optionId) : undefined;

/** Units in stock: of one option, of all options together, or of the product */
export function stockOf(p: Pick<Product, 'options' | 'stock'>, option?: ProductOption) {
	if (option) return option.stock;
	if (p.options.length) return p.options.reduce((n, o) => n + o.stock, 0);
	return p.stock;
}

export function stockState(stock: number, onOrder: boolean): StockState {
	if (stock <= 0) return onOrder ? 'order' : 'out';
	return stock <= LOW_STOCK ? 'low' : 'in';
}

/** How many can go on a list */
export const maxQty = (stock: number, onOrder: boolean) => Math.min(onOrder ? Math.max(stock, ORDER_MAX) : stock, 99);

/** The price of the product, or of one of its options */
export const priceOf = (p: Pick<Product, 'price'>, option?: ProductOption) => option?.price ?? p.price;

/** The lowest price across the options, and whether others differ, for "from 45,00 €". No min means price on request */
export function priceRange(p: Pick<Product, 'options' | 'price'>) {
	const prices = p.options.length ? p.options.map((o) => o.price ?? p.price) : [p.price];
	const known = prices.filter((x): x is number => x !== undefined);
	if (!known.length) return { min: undefined, varies: false };
	const min = Math.min(...known);
	return { min, varies: known.length < prices.length || Math.max(...known) !== min };
}

// ---------- the visitor's list ----------

/** A product as the shop pages have it, without its long description */
export type ShopProduct = Omit<Product, 'description'>;

/** One line of the list as the browser keeps it */
export interface ListItem {
	/** Product id */
	id: string;
	/** Option id, for products with sizes */
	option?: string;
	qty: number;
}

export type LineProblem = 'gone' | 'size' | 'out' | 'less';

export interface Line {
	key: string;
	item: ListItem;
	product?: ShopProduct;
	option?: ProductOption;
	qty: number;
	/** Price of one, missing when on request */
	unit?: number;
	total?: number;
	stock: number;
	max: number;
	state?: StockState;
	/** Something changed since it went on the list */
	problem?: LineProblem;
}

export const itemKey = (item: Pick<ListItem, 'id' | 'option'>) => `${item.id}:${item.option ?? ''}`;

/** The list checked against the shop as it is now: prices, stock, and anything no longer for sale. */
export function linesOf(items: ListItem[], products: ShopProduct[]): Line[] {
	const byId = new Map(products.map((p) => [p.id, p]));
	return items.map((item) => {
		const key = itemKey(item);
		const product = byId.get(item.id);
		if (!product || !product.visible) return { key, item, qty: item.qty, stock: 0, max: 0, problem: 'gone' };
		const option = optionOf(product, item.option);
		if (product.options.length && !option) {
			return { key, item, product, qty: item.qty, stock: 0, max: 0, problem: 'size' };
		}
		const stock = stockOf(product, option);
		const max = maxQty(stock, product.onOrder);
		const unit = priceOf(product, option);
		const qty = Math.min(item.qty, Math.max(max, 1));
		const problem: LineProblem | undefined = max === 0 ? 'out' : item.qty > max ? 'less' : undefined;
		return {
			key,
			item,
			product,
			option,
			qty,
			unit,
			total: unit === undefined ? undefined : unit * qty,
			stock,
			max,
			state: stockState(stock, product.onOrder),
			problem
		};
	});
}

/** Lines that can be asked for: still on sale and in stock or orderable */
export const orderable = (lines: Line[]) => lines.filter((l) => l.product && l.problem !== 'gone' && l.problem !== 'size' && l.problem !== 'out');

export function totals(lines: Line[]) {
	const ok = orderable(lines);
	return {
		total: ok.reduce((n, l) => n + (l.total ?? 0), 0),
		units: ok.reduce((n, l) => n + l.qty, 0),
		/** Lines with no price, quoted by the team */
		onRequest: ok.filter((l) => l.unit === undefined).length
	};
}

/** The list in a link, for the PDF: "id:option:qty,id::qty" */
export const encodeList = (items: ListItem[]) => items.map((i) => `${i.id}:${i.option ?? ''}:${i.qty}`).join(',');

export function decodeList(value: string | null | undefined): ListItem[] {
	const items: ListItem[] = [];
	for (const part of (value ?? '').split(',').slice(0, 60)) {
		const [id, option, qty] = part.split(':');
		const n = Number(qty);
		if (!/^[a-z0-9-]{1,40}$/.test(id ?? '') || !Number.isInteger(n) || n < 1 || n > 99) continue;
		if (option && !/^[a-z0-9-]{1,40}$/.test(option)) continue;
		items.push({ id, ...(option && { option }), qty: n });
	}
	return items;
}

// ---------- sending the list ----------

// The form on the list page and its results, shared by the page and the server
// (lib/server/shop.ts). Problems travel as codes and the page words them.

export const REQUEST_LIMITS = { name: 100, email: 200, phone: 30, message: 2000 } as const;

export interface RequestValues {
	name: string;
	email: string;
	phone: string;
	message: string;
}

export type RequestFieldError = 'name' | 'email' | 'phone' | 'long';
export type RequestError = 'bot' | 'busy' | 'failed' | 'empty' | 'changed';

export interface RequestSent {
	sent: true;
	number: number;
	name: string;
	email: string;
	/** What was sent, encoded as for the PDF link */
	items: string;
}

export interface RequestFailed {
	values: RequestValues;
	errors: Partial<Record<keyof RequestValues, RequestFieldError>>;
	error?: RequestError;
}

export type RequestResult = RequestSent | RequestFailed;

/** Where a sent list stands, for the team only */
export const STATUSES = ['new', 'answered', 'done'] as const;
export type RequestStatus = (typeof STATUSES)[number];

// ---------- addresses ----------

/** Product addresses that would clash with the shop's own pages */
export const RESERVED_SLUGS = ['lista', 'list'];

/** "351912345678" as "+351 912 345 678" */
export function phoneDisplay(digits: string) {
	const m = /^(351)(\d{3})(\d{3})(\d{3})$/.exec(digits);
	return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : digits ? `+${digits}` : '';
}

/**
 * Reads a WhatsApp number typed in the admin: "+351 912 345 678", "00351...",
 * or a Portuguese number without the country code. Returns digits with the
 * country code, '' when empty, or undefined when it isn't a phone number.
 */
export function parsePhone(input: string) {
	let d = input.replace(/[\s().-]/g, '');
	if (!d) return '';
	if (d.startsWith('+')) d = d.slice(1);
	else if (d.startsWith('00')) d = d.slice(2);
	else if (/^[29]\d{8}$/.test(d)) d = `351${d}`;
	return /^[1-9]\d{7,14}$/.test(d) ? d : undefined;
}
