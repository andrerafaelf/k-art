import type { PageServerLoad } from './$types';
import { canonical } from '#lib/server/pages.ts';

export const load: PageServerLoad = ({ params }) => {
	canonical('season', params.season, params.lang);
	return {};
};
