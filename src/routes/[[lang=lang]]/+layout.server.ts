import type { LayoutServerLoad } from './$types';
import type { Lang } from '#lib/content.ts';
import { getContent } from '#lib/server/store.ts';

export const load: LayoutServerLoad = async ({ params, depends }) => {
	depends('app:content');
	const lang: Lang = params.lang === 'en' ? 'en' : 'pt';
	const { settings, pilots, season, partners, posts, alumni, history } = await getContent();

	return {
		lang,
		settings,
		pilots,
		season,
		partners,
		alumni,
		history,
		hasNews: posts.some((p) => p.published)
	};
};
