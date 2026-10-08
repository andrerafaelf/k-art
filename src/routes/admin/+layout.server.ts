import type { LayoutServerLoad } from './$types';
import { getContent } from '#lib/server/store.ts';
import { lastSave } from '#lib/server/history.ts';

export const load: LayoutServerLoad = async ({ locals }) => {
	const lang = locals.lang ?? 'pt';
	// The sign-in page shares this layout, without the menu
	if (!locals.user) return { lang, user: undefined, last: undefined, counts: undefined };

	const content = await getContent();
	return {
		lang,
		user: locals.user,
		last: await lastSave(),
		counts: {
			drivers: content.pilots.length,
			season: content.season.length,
			news: content.posts.length,
			partners: content.partners.length,
			hall: content.history.length + content.alumni.length
		}
	};
};
