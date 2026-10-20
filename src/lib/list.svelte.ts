import { browser } from '$app/env';
import { itemKey, type ListItem } from './shop.ts';

// The visitor's shopping list. It lives in their browser only, so nothing is
// sent anywhere until they download it, send it to the team or send it on
// WhatsApp. Other tabs of the shop keep up with it.

const KEY = 'kart-shop-list';

function read(): ListItem[] {
	try {
		const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]') as ListItem[];
		return Array.isArray(saved) ? saved.filter((i) => typeof i?.id === 'string' && Number.isInteger(i.qty) && i.qty > 0) : [];
	} catch {
		return [];
	}
}

class ShopList {
	items = $state<ListItem[]>([]);
	/** Read from the browser; until then the list looks empty */
	ready = $state(false);
	/** Units on the list, for the list button */
	units = $derived(this.items.reduce((n, i) => n + i.qty, 0));
	/** Goes up each time something is added, so the list button can say so */
	added = $state(0);

	constructor() {
		if (!browser) return;
		this.items = read();
		this.ready = true;
		addEventListener('storage', (e) => {
			if (e.key === KEY) this.items = read();
		});
	}

	private save() {
		try {
			localStorage.setItem(KEY, JSON.stringify(this.items));
		} catch {
			// Private browsing or storage turned off: the list still works until the page closes
		}
	}

	qty(id: string, option?: string) {
		const key = itemKey({ id, option });
		return this.items.find((i) => itemKey(i) === key)?.qty ?? 0;
	}

	/** Adds to what is already on the list, up to max */
	add(id: string, option: string | undefined, qty: number, max = 99) {
		const key = itemKey({ id, option });
		const found = this.items.find((i) => itemKey(i) === key);
		if (found) found.qty = Math.min(found.qty + qty, max);
		else this.items.push({ id, ...(option && { option }), qty: Math.min(qty, max) });
		this.added++;
		this.save();
	}

	set(key: string, qty: number) {
		const found = this.items.find((i) => itemKey(i) === key);
		if (!found) return;
		found.qty = qty;
		this.save();
	}

	remove(key: string) {
		this.items = this.items.filter((i) => itemKey(i) !== key);
		this.save();
	}

	clear() {
		this.items = [];
		this.save();
	}
}

export const list = new ShopList();
