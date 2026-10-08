import type { Actions, PageServerLoad } from './$types';
import { isLive } from '#lib/content.ts';
import { getContent } from '#lib/server/store.ts';
import { contact } from '#lib/server/contact.ts';

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

export const actions = { contact } satisfies Actions;
