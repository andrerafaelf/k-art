import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { hallPath } from '#lib/i18n.ts';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { lang } = await parent();
	// Earlier links used /hall-da-fama
	if (params.hall !== 'hall-of-fame') redirect(308, hallPath(lang));
	return {};
};
