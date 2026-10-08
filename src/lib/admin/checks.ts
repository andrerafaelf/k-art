import { numbered, roundEnd, type Content, type L } from '#lib/content.ts';

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
export function checks(content: Content, now = Date.now()): Check[] {
	const list: Check[] = [];

	for (const r of numbered(content.season)) {
		if (roundEnd(r) <= now && !r.results.length) {
			list.push({
				kind: 'warn',
				text: `Round ${r.round}, ${r.location}, has finished. Add the results.`,
				href: `/admin/season/${r.id}`
			});
		}
	}

	for (const p of content.pilots) {
		if (!p.photo) {
			list.push({ kind: 'info', text: `${p.first} ${p.last} has no photo yet.`, href: `/admin/drivers/${p.id}` });
		}
	}

	const untranslated: { text: string; href: string }[] = [];
	const s = content.settings;
	if ([s.heroEyebrow, s.heroLines, s.heroLead, s.seasonIntro, s.partnersIntro, s.tryouts, s.press].some(missingEn)) {
		untranslated.push({ text: 'Site settings', href: '/admin/settings' });
	} else if (s.packages.some((p) => [p.tier, p.title, p.body].some(missingEn))) {
		untranslated.push({ text: 'Site settings', href: '/admin/settings' });
	}
	for (const p of content.pilots) {
		if ([p.best, p.quote].some(missingEn)) untranslated.push({ text: `${p.first} ${p.last}`, href: `/admin/drivers/${p.id}` });
	}
	for (const r of content.season) {
		if ([r.venue, r.series].some(missingEn)) untranslated.push({ text: `${r.location} round`, href: `/admin/season/${r.id}` });
	}
	for (const p of content.posts) {
		if ([p.title, p.excerpt, p.body].some(missingEn)) untranslated.push({ text: p.title.pt || 'A news post', href: `/admin/news/${p.id}` });
	}
	for (const u of untranslated) {
		list.push({ kind: 'info', text: `${u.text}: no English version yet, so the English site shows the Portuguese text.`, href: u.href });
	}

	return list;
}
