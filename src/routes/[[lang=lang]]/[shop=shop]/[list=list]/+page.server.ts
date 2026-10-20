import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getContent } from '#lib/server/store.ts';
import { request } from '#lib/server/shop.ts';
import { LIST, PAGES, listPath } from '#lib/i18n.ts';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { lang } = await parent();
	if (params.shop !== PAGES.shop[lang] || params.list !== LIST[lang]) redirect(308, listPath(lang));
	const { products } = await getContent();
	// Everything on sale, to check the list against; the list itself is in the visitor's browser
	return { products: products.filter((p) => p.visible).map(({ description: _, ...p }) => p) };
};

export const actions = { request } satisfies Actions;
