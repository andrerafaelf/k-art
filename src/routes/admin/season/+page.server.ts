import type { PageServerLoad } from './$types';
import { getContent } from '#lib/server/store.ts';
import { numbered } from '#lib/content.ts';

export const load: PageServerLoad = async () => {
	const { season, settings } = await getContent();
	return { rounds: numbered(season), year: settings.seasonYear };
};
