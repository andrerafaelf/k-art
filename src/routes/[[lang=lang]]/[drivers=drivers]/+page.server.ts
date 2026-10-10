import type { PageServerLoad } from './$types';
import { canonical } from '#lib/server/pages.ts';

export const load: PageServerLoad = ({ params }) => {
	canonical('drivers', params.drivers, params.lang);
	return {};
};
