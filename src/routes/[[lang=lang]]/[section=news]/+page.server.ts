import type { PageServerLoad } from './$types';
import { isLive } from '#lib/content.ts';
import { getContent } from '#lib/server/store.ts';
import { canonical } from '#lib/server/pages.ts';

export const load: PageServerLoad = async ({ params }) => {
	// /noticias for Portuguese, /en/news for English; fix any mix of the two
	canonical('news', params.section, params.lang);

	const { posts } = await getContent();
	return {
		posts: posts
			.filter((p) => isLive(p))
			.sort((a, b) => b.date.localeCompare(a.date))
			.map(({ body: _, ...summary }) => summary)
	};
};
