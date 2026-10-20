import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { slugify, type Product, type ProductOption } from '#lib/content.ts';
import { CATEGORIES, FITS, RESERVED_SLUGS, parseMoney } from '#lib/shop.ts';
import { getContent, update, newId, saveUpload, UploadError } from '#lib/server/store.ts';
import { FormReader } from '#lib/server/form.ts';
import { msg } from '#lib/server/lang.ts';
import { revision } from '#lib/server/revision.ts';

const MAX_PHOTOS = 8;
const MAX_OPTIONS = 30;

const blank = (): Product => ({
	id: '',
	slug: '',
	name: { pt: '', en: '' },
	description: { pt: '', en: '' },
	category: 'other',
	fits: [],
	condition: 'new',
	conditionNote: { pt: '', en: '' },
	stock: 1,
	options: [],
	optionName: { pt: '', en: '' },
	onOrder: false,
	photos: [],
	visible: true
});

export const load: PageServerLoad = async ({ params }) => {
	const { products } = await getContent();
	const product = params.id === 'new' ? blank() : products.find((p) => p.id === params.id);
	if (!product) error(404, 'Product not found');
	// Suggested "fits" tags: the usual ones and any already used in the shop
	const fits = [...new Set([...FITS, ...products.flatMap((p) => p.fits)])];
	return { product, fits, maxPhotos: MAX_PHOTOS, isNew: params.id === 'new', rev: params.id === 'new' ? undefined : revision(product) };
};

/** A slug no other product uses, adding -2, -3... when needed */
function freeSlug(base: string, taken: Set<string>) {
	let slug = base;
	for (let n = 2; taken.has(slug) || RESERVED_SLUGS.includes(slug); n++) slug = `${base}-${n}`;
	return slug;
}

export const actions: Actions = {
	save: async ({ request, params }) => {
		const f = new FormReader(await request.formData());
		const content = await getContent();
		const existing = content.products.find((p) => p.id === params.id);
		if (params.id !== 'new' && !existing) error(404, 'Product not found');
		const m = msg().product;

		const money = (name: string) => {
			const value = parseMoney(f.raw(name));
			if (Number.isNaN(value)) f.error(name, m.priceInvalid);
			return Number.isNaN(value) ? undefined : value;
		};

		const fields = {
			name: f.l('name', { required: true, max: 120 }),
			description: f.l('description', { max: 8000 }),
			category: f.choice('category', CATEGORIES, 'other'),
			brand: f.text('brand', { max: 60 }),
			ref: f.text('ref', { max: 60 }),
			condition: f.choice('condition', ['new', 'used'] as const, 'new'),
			conditionNote: f.l('conditionNote', { max: 300 }),
			price: money('price'),
			was: money('was'),
			optionName: f.l('optionName', { max: 30 }),
			onOrder: f.bool('onOrder'),
			visible: f.bool('visible')
		};
		if (fields.was !== undefined && (fields.price === undefined || fields.was <= fields.price)) f.error('was', m.wasLower);

		// "Fits" is typed as a comma separated list
		const fits = [
			...new Set(
				f
					.text('fits', { max: 400 })
					.split(',')
					.map((s) => s.trim().slice(0, 30))
					.filter(Boolean)
			)
		].slice(0, 12);

		// Sizes come as rows of fields in order: label, stock and an optional own price
		const sized = f.bool('hasOptions');
		const options: ProductOption[] = [];
		if (sized) {
			const ids = f.all('option.id');
			const labels = f.all('option.label');
			const stocks = f.all('option.stock');
			const prices = f.all('option.price');
			const kept = new Set(existing?.options.map((o) => o.id));
			labels.slice(0, MAX_OPTIONS).forEach((label, i) => {
				const stock = Number(stocks[i] || '0');
				if (!label) f.error(`option.${i}.label`, m.optionRequired);
				else if (label.length > 20) f.error(`option.${i}.label`, msg().errors.maxChars(20));
				else if (labels.slice(0, i).some((l) => l.toLowerCase() === label.toLowerCase())) f.error(`option.${i}.label`, m.optionDup);
				if (!Number.isInteger(stock) || stock < 0 || stock > 9999) f.error(`option.${i}.stock`, msg().errors.between(0, 9999));
				const price = parseMoney(prices[i] ?? '');
				if (Number.isNaN(price)) f.error(`option.${i}.price`, m.priceInvalid);
				options.push({
					// Options keep their id across saves, so lists and requests still find them
					id: kept.has(ids[i]) ? ids[i] : newId(),
					label,
					stock: Number.isInteger(stock) ? stock : 0,
					...(price !== undefined && !Number.isNaN(price) && { price })
				});
			});
			if (!options.length) f.error('options', m.optionsEmpty);
		}
		const stock = sized ? 0 : f.int('stock', { min: 0, max: 9999 });

		// The address is made from the Portuguese name unless one is typed in
		const slug = slugify(f.text('slug', { max: 80 }) || fields.name.pt);
		if (RESERVED_SLUGS.includes(slug)) f.error('slug', m.slugReserved);
		else if (content.products.some((p) => p.slug === slug && p.id !== existing?.id)) f.error('slug', m.slugTaken);

		const order = f.all('photos.order').slice(0, MAX_PHOTOS + 1);
		if (order.length > MAX_PHOTOS) f.error('photos', m.tooMany(MAX_PHOTOS));

		if (!f.ok) return f.fail();
		const conflict = await f.conflict(existing, 'products', existing?.id);
		if (conflict) return conflict;

		// New photos are saved only once the rest of the form is fine, so failed saves leave no stray files
		const uploaded: (string | undefined)[] = [];
		for (const file of f.files('photos.new')) {
			try {
				uploaded.push(await saveUpload(file));
			} catch (e) {
				if (!(e instanceof UploadError)) throw e;
				f.error('photos', e.message);
				uploaded.push(undefined);
			}
		}
		if (!f.ok) return f.fail();
		const photos = order
			.map((o) => (o.startsWith('k:') ? existing?.photos.find((src) => src === o.slice(2)) : uploaded[Number(o.slice(2))]))
			.filter((src): src is string => !!src);

		const id = existing?.id ?? newId();
		await update((draft) => {
			const product: Product = { id, slug, ...fields, fits, stock, options, photos };
			for (const key of ['brand', 'ref', 'price', 'was'] as const) if (product[key] === undefined || product[key] === '') delete product[key];
			const i = draft.products.findIndex((p) => p.id === id);
			if (i >= 0) draft.products[i] = product;
			else draft.products.push(product);
		});

		if (!existing) redirect(303, `/admin/shop/${id}?saved=${encodeURIComponent(m.added)}`);
		return { message: m.saved };
	},

	/** A hidden copy to start a similar product from */
	duplicate: async ({ params }) => {
		const content = await getContent();
		const source = content.products.find((p) => p.id === params.id);
		if (!source) error(404, 'Product not found');
		const m = msg().product;
		const id = newId();
		await update((draft) => {
			const copy: Product = {
				...structuredClone(source),
				id,
				slug: freeSlug(`${source.slug}-copia`, new Set(draft.products.map((p) => p.slug))),
				name: { pt: m.copyOf(source.name.pt), en: source.name.en && m.copyOf(source.name.en) },
				options: source.options.map((o) => ({ ...o, id: newId() })),
				visible: false
			};
			draft.products.splice(draft.products.findIndex((p) => p.id === source.id) + 1, 0, copy);
		});
		redirect(303, `/admin/shop/${id}?saved=${encodeURIComponent(m.duplicated)}`);
	},

	delete: async ({ params }) => {
		await update((draft) => {
			draft.products = draft.products.filter((p) => p.id !== params.id);
		});
		redirect(303, `/admin/shop?saved=${encodeURIComponent(msg().product.removed)}`);
	}
};
