import type { PageServerLoad } from './$types';
import { canonical } from '#lib/server/pages.ts';

export const load: PageServerLoad = ({ params }) => {
	canonical('partners', params.partners, params.lang);
	return {};
};
