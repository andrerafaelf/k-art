import type { PageServerLoad } from './$types';
import { getContent } from '#lib/server/store.ts';
import { byYear } from '#lib/content.ts';

export const load: PageServerLoad = async () => {
	const { history, alumni, settings, season } = await getContent();
	return {
		history: byYear(history),
		alumni,
		year: settings.seasonYear,
		archived: history.some((s) => s.year === settings.seasonYear),
		hasCalendar: season.length > 0
	};
};
