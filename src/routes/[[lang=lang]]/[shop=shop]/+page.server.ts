import type { PageServerLoad } from './$types';
import { canonical } from '#lib/server/pages.ts';
import { getContent } from '#lib/server/store.ts';
import { summary } from '#lib/server/shop.ts';

export const load: PageServerLoad = async ({ params, parent }) => {
	// /loja for Portuguese, /en/shop for English; fix any mix of the two
	canonical('shop', params.shop, params.lang);
	await parent();
	const { products } = await getContent();
	return { products: products.filter((p) => p.visible).map(summary) };
};
