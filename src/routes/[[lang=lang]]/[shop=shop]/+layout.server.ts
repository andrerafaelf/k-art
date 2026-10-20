import type { LayoutServerLoad } from './$types';
import { openShop } from '#lib/server/shop.ts';

// Every page of the shop is a 404 while it is switched off in the admin, except
// for people signed in, who see it as a preview
export const load: LayoutServerLoad = async ({ locals, setHeaders }) => {
	const { shop } = await openShop(!!locals.user);
	if (locals.user) setHeaders({ 'cache-control': 'private, no-store' });
	return { closed: !shop.enabled, signedIn: !!locals.user };
};
