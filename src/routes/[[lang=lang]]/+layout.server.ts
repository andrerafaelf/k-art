import type { LayoutServerLoad } from './$types';
import { isLive, type Lang } from '#lib/content.ts';
import { getContent } from '#lib/server/store.ts';

export const load: LayoutServerLoad = async ({ params, depends }) => {
	depends('app:content');
	const lang: Lang = params.lang === 'en' ? 'en' : 'pt';
	const { settings, pilots, season, partners, posts, alumni, history, texts } = await getContent();

	return {
		lang,
		settings,
		pilots,
		season,
		partners,
		alumni,
		history,
		texts,
		hasNews: posts.some((p) => isLive(p))
	};
};
