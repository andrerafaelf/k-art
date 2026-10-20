import type { Content } from '#lib/content.ts';

// What the change log records. Every save is compared with the version before
// it, so each entry says exactly what changed without the pages having to
// describe their own edits.

export type Kind = 'pilots' | 'season' | 'partners' | 'posts' | 'alumni' | 'history' | 'products' | 'settings' | 'shop' | 'texts';
export type Op = 'add' | 'edit' | 'remove' | 'move' | 'publish' | 'unpublish';

export interface Change {
	kind: Kind;
	op: Op;
	id?: string;
	/** Name of the item at the time, so the log still reads well after it is deleted */
	name?: string;
	/** Race date, for rounds */
	date?: string;
	/** Top-level fields that changed, for edits */
	fields?: string[];
}

export type AccountEvent =
	| 'signin'
	| 'signout'
	| 'password'
	| 'profile'
	| 'sessions'
	| 'user-add'
	| 'user-remove'
	| 'user-password'
	| 'lockout'
	| 'first-account';

export interface Actor {
	id: string;
	name: string;
}

export interface LogEntry {
	id: string;
	at: string;
	/** Who did it. Missing for things the server did by itself */
	by?: Actor;
	changes?: Change[];
	/** The saved copy of the whole site from just before this change */
	backup?: string;
	/** For a restore: when the version that was put back had been saved */
	restored?: string;
	account?: { event: AccountEvent; name?: string; detail?: string };
}

type Item = { id: string } & Record<string, unknown>;

const COLLECTIONS = ['pilots', 'season', 'posts', 'partners', 'alumni', 'history', 'products'] as const;
// Lists shown on the site in the order they are stored. The others are sorted by date or year.
const ORDERED = new Set<Kind>(['pilots', 'partners', 'alumni', 'products']);

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function changedKeys(a: Record<string, unknown>, b: Record<string, unknown>) {
	return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => !same(a[k], b[k]));
}

function label(kind: Kind, x: Item): Pick<Change, 'name' | 'date'> {
	switch (kind) {
		case 'pilots':
		case 'alumni':
			return { name: `${x.first} ${x.last}` };
		case 'season':
			return { name: String(x.location), date: String(x.date) };
		case 'posts': {
			const title = x.title as { pt: string; en: string };
			return { name: title.pt || title.en };
		}
		case 'products': {
			const name = x.name as { pt: string; en: string };
			return { name: name.pt || name.en };
		}
		case 'partners':
			return { name: String(x.name) };
		case 'history':
			return { name: String(x.year) };
		default:
			return {};
	}
}

/** Everything that differs between two versions of the site. */
export function diff(before: Content, after: Content): Change[] {
	const out: Change[] = [];

	for (const kind of COLLECTIONS) {
		const a = before[kind] as unknown as Item[];
		const b = after[kind] as unknown as Item[];
		const old = new Map(a.map((x) => [x.id, x]));
		const now = new Map(b.map((x) => [x.id, x]));

		for (const x of b) {
			const prev = old.get(x.id);
			if (!prev) {
				out.push({ kind, op: 'add', id: x.id, ...label(kind, x) });
				continue;
			}
			let fields = changedKeys(prev, x);
			if (!fields.length) continue;
			let op: Op = 'edit';
			// Publishing a post or showing a product reads as its own action
			const flag = kind === 'posts' ? 'published' : kind === 'products' ? 'visible' : undefined;
			if (flag && fields.includes(flag)) {
				op = x[flag] ? 'publish' : 'unpublish';
				fields = fields.filter((f) => f !== flag);
			}
			out.push({ kind, op, id: x.id, ...label(kind, x), ...(fields.length && { fields }) });
		}
		for (const x of a) {
			if (!now.has(x.id)) out.push({ kind, op: 'remove', id: x.id, ...label(kind, x) });
		}
		if (ORDERED.has(kind)) {
			const order = (list: Item[], other: Map<string, Item>) =>
				list
					.filter((x) => other.has(x.id))
					.map((x) => x.id)
					.join();
			if (order(a, now) !== order(b, old)) out.push({ kind, op: 'move' });
		}
	}

	const fields = changedKeys(
		before.settings as unknown as Record<string, unknown>,
		after.settings as unknown as Record<string, unknown>
	);
	if (fields.length) out.push({ kind: 'settings', op: 'edit', fields });

	// Opening or closing the shop reads as its own action
	const shop = changedKeys(
		before.shop as unknown as Record<string, unknown>,
		after.shop as unknown as Record<string, unknown>
	);
	if (shop.includes('enabled')) out.push({ kind: 'shop', op: after.shop.enabled ? 'publish' : 'unpublish' });
	if (shop.some((f) => f !== 'enabled')) out.push({ kind: 'shop', op: 'edit', fields: shop.filter((f) => f !== 'enabled') });

	// Each text that changed, by its key in lib/texts.ts
	const texts = changedKeys(
		(before.texts ?? {}) as Record<string, unknown>,
		(after.texts ?? {}) as Record<string, unknown>
	);
	if (texts.length) out.push({ kind: 'texts', op: 'edit', fields: texts });

	return out;
}
