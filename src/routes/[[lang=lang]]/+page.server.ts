import type { PageServerLoad } from './$types';
import { isLive } from '#lib/content.ts';
import { getContent } from '#lib/server/store.ts';

export const load: PageServerLoad = async () => {
	const { posts } = await getContent();
	return {
		latest: posts
			.filter((p) => isLive(p))
			.sort((a, b) => b.date.localeCompare(a.date))
			.slice(0, 3)
			.map(({ body: _, ...summary }) => summary)
	};
};
