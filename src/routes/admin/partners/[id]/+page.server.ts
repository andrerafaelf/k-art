import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Partner } from '#lib/content.ts';
import { getContent, update, newId } from '#lib/server/store.ts';
import { FormReader } from '#lib/server/form.ts';
import { readImage } from '#lib/server/images.ts';

export const load: PageServerLoad = async ({ params }) => {
	const { partners } = await getContent();
	const partner =
		params.id === 'new'
			? ({ id: '', name: '', logo: '', tone: 'dark' } satisfies Partner)
			: partners.find((p) => p.id === params.id);
	if (!partner) error(404, 'Partner not found');
	return { partner, isNew: params.id === 'new' };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const f = new FormReader(await request.formData());
		const content = await getContent();
		const existing = content.partners.find((p) => p.id === params.id);
		if (params.id !== 'new' && !existing) error(404, 'Partner not found');

		const fields = {
			name: f.text('name', { required: true, max: 60 }),
			url: f.url('url'),
			tone: f.choice('tone', ['dark', 'light'] as const, 'dark')
		};
		if (!existing && !f.file('logo')) f.error('logo', 'Upload the partner’s logo');
		if (!f.ok) return f.fail();

		const logo = await readImage(f, 'logo', existing?.logo, { svg: true, maxMb: 4 });
		if (!logo) f.error('logo', 'A partner needs a logo');
		if (!f.ok) return f.fail();

		const id = existing?.id ?? newId();
		await update((draft) => {
			const partner: Partner = { id, ...fields, logo: logo! };
			if (!partner.url) delete partner.url;
			const i = draft.partners.findIndex((p) => p.id === id);
			if (i >= 0) draft.partners[i] = partner;
			else draft.partners.push(partner);
		});

		if (!existing) redirect(303, `/admin/partners?saved=${encodeURIComponent('Partner added')}`);
		return { message: 'Partner saved' };
	},

	delete: async ({ params }) => {
		await update((draft) => {
			draft.partners = draft.partners.filter((p) => p.id !== params.id);
		});
		redirect(303, `/admin/partners?saved=${encodeURIComponent('Partner removed')}`);
	}
};
