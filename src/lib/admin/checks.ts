import { numbered, roundEnd, type Content, type L, type Lang } from '#lib/content.ts';
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
export function checks(content: Content, m: AdminMessages, lang: Lang, now = Date.now()): Check[] {
	const list: Check[] = [];

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
	for (const u of untranslated) {
		list.push({ kind: 'info', text: m.checks.english(u.text), href: u.href });
	}

	return list;
}
