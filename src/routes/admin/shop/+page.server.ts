import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getContent, update } from '#lib/server/store.ts';
import { FormReader } from '#lib/server/form.ts';
import { msg } from '#lib/server/lang.ts';
import { isDemo, parsePhone } from '#lib/shop.ts';
import { demoProducts } from '#lib/server/demo.ts';

export const load: PageServerLoad = async () => {
	const { products, shop } = await getContent();
	return { products, shop };
};

export const actions: Actions = {
	/** Switches the shop on or off on the site */
	toggle: async ({ request }) => {
		const on = (await request.formData()).get('on') === '1';
		await update((draft) => {
			draft.shop.enabled = on;
		});
		const m = msg().shop;
		return { message: on ? m.turnedOn : m.turnedOff };
	},

	whatsapp: async ({ request }) => {
		const f = new FormReader(await request.formData());
		const number = parsePhone(f.raw('whatsapp'));
		if (number === undefined) f.error('whatsapp', msg().shop.whatsappInvalid);
		if (!f.ok) return f.fail();
		await update((draft) => {
			draft.shop.whatsapp = number!;
		});
		return { message: msg().shop.whatsappSaved };
	},

	move: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id'));
		const dir = data.get('dir') === 'up' ? -1 : 1;
		await update((draft) => {
			const i = draft.products.findIndex((p) => p.id === id);
			if (i < 0) error(404, 'Product not found');
			const j = i + dir;
			if (j < 0 || j >= draft.products.length) return;
			[draft.products[i], draft.products[j]] = [draft.products[j], draft.products[i]];
		});
		return { message: msg().common.orderSaved };
	},

	/** One more or one fewer in stock, straight from the list, for products without sizes */
	stock: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id'));
		const step = data.get('dir') === 'down' ? -1 : 1;
		await update((draft) => {
			const p = draft.products.find((x) => x.id === id);
			if (!p) error(404, 'Product not found');
			if (p.options.length) return;
			p.stock = Math.min(Math.max(p.stock + step, 0), 9999);
		});
		return { message: msg().shop.stockSaved };
	},

	/** Example products to try the shop with, all removed again with `undemo` */
	demo: async () => {
		const { products } = await getContent();
		const examples = await demoProducts(products);
		await update((draft) => {
			draft.products.push(...examples);
		});
		return { message: msg().shop.demoAdded };
	},

	undemo: async () => {
		await update((draft) => {
			draft.products = draft.products.filter((p) => !isDemo(p));
		});
		return { message: msg().shop.demoRemoved };
	}
};
