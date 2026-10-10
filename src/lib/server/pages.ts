import { redirect } from '@sveltejs/kit';
import type { Lang } from '#lib/content.ts';
import { PAGES, pagePath, type PageId } from '#lib/i18n.ts';

/**
 * Each page has one address per language, so /en/pilotos goes to /en/drivers
 * and /drivers to /pilotos. Call from the page's load with its param.
 */
export function canonical(id: PageId, slug: string, lang: string | undefined) {
	const l: Lang = lang === 'en' ? 'en' : 'pt';
	if (slug !== PAGES[id][l]) redirect(308, pagePath(id, l));
}
