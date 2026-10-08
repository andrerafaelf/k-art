import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isLive } from '#lib/content.ts';
import { getContent } from '#lib/server/store.ts';
import { newsPath } from '#lib/i18n.ts';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { lang } = await parent();
	// /noticias for Portuguese, /en/news for English; fix any mix of the two
	if (params.section !== (lang === 'pt' ? 'noticias' : 'news')) redirect(308, newsPath(lang));

	const { posts } = await getContent();
	return {
		posts: posts
			.filter((p) => isLive(p))
			.sort((a, b) => b.date.localeCompare(a.date))
			.map(({ body: _, ...summary }) => summary)
	};
};
