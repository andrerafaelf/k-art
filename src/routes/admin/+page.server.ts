import type { PageServerLoad } from './$types';
import { getContent } from '#lib/server/store.ts';
import { historyRows } from '#lib/server/history.ts';
import { msg } from '#lib/server/lang.ts';
import { getRequests } from '#lib/server/requests.ts';
import { maxQty, stockOf } from '#lib/shop.ts';
import { checks } from '#lib/admin/checks.ts';
import { isLive, numbered, nextRound, seasonSummary } from '#lib/content.ts';

export const load: PageServerLoad = async ({ locals }) => {
	const content = await getContent();
	const rounds = numbered(content.season);
	const waiting = (await getRequests()).filter((r) => r.status === 'new').length;
	const forSale = content.products.filter((p) => p.visible);
	return {
		next: nextRound(rounds, Date.now()),
		total: rounds.length,
		summary: seasonSummary(content.season),
		drivers: content.pilots.length,
		classes: new Set(content.pilots.map((p) => p.category)).size,
		year: content.settings.seasonYear,
		posts: {
			published: content.posts.filter((p) => isLive(p)).length,
			scheduled: content.posts.filter((p) => p.published && !isLive(p)).length,
			drafts: content.posts.filter((p) => !p.published).length
		},
		// Only once the shop is in use
		shop:
			content.shop.enabled || content.products.length
				? {
						enabled: content.shop.enabled,
						waiting,
						products: forSale.length,
						out: forSale.filter((p) => !maxQty(stockOf(p), p.onOrder)).length
					}
				: undefined,
		checks: checks(content, msg(), locals.lang ?? 'pt', Date.now(), waiting),
		recent: (await historyRows()).rows.slice(0, 6)
	};
};
