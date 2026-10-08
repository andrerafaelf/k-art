import type { Actions, PageServerLoad } from './$types';
import { ZONES } from '#lib/content.ts';
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
			location: f.text('location', { required: true, max: 80 }),
			heroEyebrow: f.l('heroEyebrow', { required: true, max: 60 }),
			heroLines: f.lines('heroLines', { required: true, maxLines: 5, max: 16 }),
			heroLead: f.l('heroLead', { required: true, max: 260 }),
			seasonIntro: f.l('seasonIntro', { required: true, max: 200 }),
			partnersIntro: f.l('partnersIntro', { required: true, max: 260 }),
			tryouts: f.l('tryouts', { required: true, max: 260 }),
			press: f.l('press', { required: true, max: 260 }),
			packages: ZONES.map((zone) => ({
				zone,
				tier: f.l(`${zone}.tier`, { required: true, max: 30 }),
				title: f.l(`${zone}.title`, { required: true, max: 30 }),
				body: f.l(`${zone}.body`, { required: true, max: 200 })
			}))
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
