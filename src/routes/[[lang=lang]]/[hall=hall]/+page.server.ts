import type { PageServerLoad } from './$types';
import { canonical } from '#lib/server/pages.ts';

export const load: PageServerLoad = ({ params }) => {
	// Earlier links used /hall-da-fama
	canonical('hall', params.hall, params.lang);
	return {};
};
