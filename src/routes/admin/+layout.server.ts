import type { LayoutServerLoad } from './$types';
import { getContent } from '#lib/server/store.ts';

export const load: LayoutServerLoad = async ({ locals }) => {
	const content = await getContent();
	return {
		admin: locals.admin ?? '',
		updatedAt: content.updatedAt,
		counts: {
			drivers: content.pilots.length,
			season: content.season.length,
			news: content.posts.length,
			partners: content.partners.length,
			hall: content.history.length + content.alumni.length
		}
	};
};
