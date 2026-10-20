import { numbered, roundEnd, type Content, type L, type Lang, type Product } from '#lib/content.ts';
import { isDemo, maxQty, stockOf } from '#lib/shop.ts';
import { GROUPS, type TextKey } from '#lib/texts.ts';
import type { AdminMessages } from './i18n.ts';

export interface Check {
	text: string;
	href: string;
	kind: 'warn' | 'info';
}

const missingEn = (v: L<string> | L<string[]>) => {
	const has = (x: string | string[]) => (Array.isArray(x) ? x.some((s) => s.trim()) : !!x.trim());
	return has(v.pt) && !has(v.en);
};

/** Things worth doing next, shown on the admin overview. */
export function checks(content: Content, m: AdminMessages, lang: Lang, now = Date.now(), waiting = 0): Check[] {
	const list: Check[] = [];

	// Shop requests nobody has answered yet come first
	if (waiting) list.push({ kind: 'warn', text: m.checks.requests(waiting), href: '/admin/shop/requests' });

	for (const r of numbered(content.season)) {
		if (roundEnd(r) <= now && !r.results.length) {
			list.push({ kind: 'warn', text: m.checks.results(r.round, r.location), href: `/admin/season/${r.id}` });
		}
	}

	for (const p of content.pilots) {
		if (!p.photo) {
			list.push({ kind: 'info', text: m.checks.photo(`${p.first} ${p.last}`), href: `/admin/drivers/${p.id}` });
		}
	}

	// Shop products are named one by one, or counted once there are several, so a big shop doesn't flood the list
	const examples = content.products.filter(isDemo).length;
	if (examples) list.push({ kind: content.shop.enabled ? 'warn' : 'info', text: m.checks.demo(examples), href: '/admin/shop' });
	// The examples aren't real stock, so they don't need photos, English or restocking
	const forSale = content.products.filter((p) => p.visible && !isDemo(p));
	const name = (p: Product) => p.name.pt || p.name.en;
	const href = (p: Product) => `/admin/shop/${p.id}`;
	const soldOut = forSale.filter((p) => !maxQty(stockOf(p), p.onOrder));
	const noPhoto = forSale.filter((p) => !p.photos.length);
	if (soldOut.length === 1) list.push({ kind: 'info', text: m.checks.soldOut(name(soldOut[0])), href: href(soldOut[0]) });
	else if (soldOut.length) list.push({ kind: 'info', text: m.checks.soldOutMany(soldOut.length), href: '/admin/shop' });
	if (noPhoto.length === 1) list.push({ kind: 'info', text: m.checks.photo(name(noPhoto[0])), href: href(noPhoto[0]) });
	else if (noPhoto.length) list.push({ kind: 'info', text: m.checks.photosMany(noPhoto.length), href: '/admin/shop' });

	const untranslated: { text: string; href: string }[] = [];
	for (const g of GROUPS) {
		const texts = g.fields.map((f) => content.texts[f.key as TextKey]).filter((v) => v !== undefined);
		if (texts.some(missingEn)) untranslated.push({ text: m.checks.texts(g.label[lang]), href: `/admin/texts/${g.id}` });
	}
	for (const r of content.season) {
		if ([r.venue, r.series].some(missingEn)) untranslated.push({ text: m.checks.round(r.location), href: `/admin/season/${r.id}` });
	}
	for (const p of content.posts) {
		if ([p.title, p.excerpt, p.body].some(missingEn)) untranslated.push({ text: p.title.pt || m.checks.post, href: `/admin/news/${p.id}` });
	}
	const english = forSale.filter((p) => [p.name, p.description].some(missingEn));
	if (english.length === 1) untranslated.push({ text: name(english[0]) || m.checks.product, href: href(english[0]) });
	else if (english.length) untranslated.push({ text: m.checks.products(english.length), href: '/admin/shop' });
	for (const u of untranslated) {
		list.push({ kind: 'info', text: m.checks.english(u.text), href: u.href });
	}

	return list;
}
