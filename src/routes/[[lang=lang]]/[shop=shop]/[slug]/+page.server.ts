import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getContent } from '#lib/server/store.ts';
import { PAGES, shopPath } from '#lib/i18n.ts';

export const load: PageServerLoad = async ({ params, parent, locals }) => {
	const { lang } = await parent();
	const { products } = await getContent();
	// Hidden products can be previewed here by anyone signed in to the admin
	const product = products.find((p) => p.slug === params.slug && (p.visible || locals.user));
	if (!product) error(404, 'Not found');
	if (params.shop !== PAGES.shop[lang]) redirect(308, shopPath(lang, product.slug));

	return { product, edit: locals.user ? `/admin/shop/${product.id}` : undefined };
};
