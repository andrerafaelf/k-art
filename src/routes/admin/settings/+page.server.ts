import type { Actions, PageServerLoad } from './$types';
import { getContent, update } from '#lib/server/store.ts';
import { FormReader } from '#lib/server/form.ts';
import { msg } from '#lib/server/lang.ts';
import { revision } from '#lib/server/revision.ts';

export const load: PageServerLoad = async () => {
	const { settings } = await getContent();
	return { settings, rev: revision(settings) };
};

export const actions: Actions = {
	save: async ({ request }) => {
		const f = new FormReader(await request.formData());
		const year = new Date().getFullYear();

		const settings = {
			seasonYear: f.int('seasonYear', { min: 2020, max: year + 2 }),
			email: f.email('email'),
			instagram: f.text('instagram', { required: true, max: 40 }).replace(/^@/, ''),
			location: f.text('location', { required: true, max: 80 })
		};
		if (!f.ok) return f.fail();
		const conflict = await f.conflict((await getContent()).settings, 'settings');
		if (conflict) return conflict;

		await update((draft) => {
			draft.settings = settings;
		});
		return { message: msg().settings.saved };
	}
};
