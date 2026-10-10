import type { Actions, PageServerLoad } from './$types';
import { canonical } from '#lib/server/pages.ts';
import { contact } from '#lib/server/contact.ts';

export const load: PageServerLoad = ({ params }) => {
	canonical('contact', params.contact, params.lang);
	return {};
};

export const actions = { contact } satisfies Actions;
