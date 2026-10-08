import type { PageServerLoad } from './$types';
import { getContent } from '#lib/server/store.ts';

export const load: PageServerLoad = async () => {
	const { posts } = await getContent();
	return {
		posts: [...posts]
			.sort((a, b) => b.date.localeCompare(a.date))
			.map(({ body: _, ...summary }) => summary)
	};
};
