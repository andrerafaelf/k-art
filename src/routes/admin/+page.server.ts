import type { PageServerLoad } from './$types';
import { getContent } from '#lib/server/store.ts';
import { checks } from '#lib/admin/checks.ts';
import { numbered, nextRound, seasonSummary, teamRecord } from '#lib/content.ts';

export const load: PageServerLoad = async () => {
	const content = await getContent();
	const rounds = numbered(content.season);
	return {
		next: nextRound(rounds, Date.now()),
		total: rounds.length,
		summary: seasonSummary(content.season),
		record: teamRecord(content.pilots),
		year: content.settings.seasonYear,
		posts: {
			published: content.posts.filter((p) => p.published).length,
			drafts: content.posts.filter((p) => !p.published).length
		},
		checks: checks(content)
	};
};
