import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Partner } from '#lib/content.ts';
import { getContent, update, newId } from '#lib/server/store.ts';
import { FormReader } from '#lib/server/form.ts';
import { readImage } from '#lib/server/images.ts';
import { msg } from '#lib/server/lang.ts';
import { revision } from '#lib/server/revision.ts';

export const load: PageServerLoad = async ({ params }) => {
	const { partners } = await getContent();
	const partner =
		params.id === 'new'
			? ({ id: '', name: '', logo: '', tone: 'dark' } satisfies Partner)
			: partners.find((p) => p.id === params.id);
	if (!partner) error(404, 'Partner not found');
	return { partner, isNew: params.id === 'new', rev: params.id === 'new' ? undefined : revision(partner) };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const f = new FormReader(await request.formData());
		const content = await getContent();
		const existing = content.partners.find((p) => p.id === params.id);
		if (params.id !== 'new' && !existing) error(404, 'Partner not found');
		const m = msg().partner;

		const fields = {
			name: f.text('name', { required: true, max: 60 }),
			url: f.url('url'),
			tone: f.choice('tone', ['dark', 'light'] as const, 'dark')
		};
		if (!existing && !f.file('logo')) f.error('logo', m.upload);
		if (!f.ok) return f.fail();
		const conflict = await f.conflict(existing, 'partners', existing?.id);
		if (conflict) return conflict;

		const logo = await readImage(f, 'logo', existing?.logo, { svg: true, maxMb: 4 });
		if (!logo) f.error('logo', m.needsLogo);
		if (!f.ok) return f.fail();

		const id = existing?.id ?? newId();
		await update((draft) => {
			const partner: Partner = { id, ...fields, logo: logo! };
			if (!partner.url) delete partner.url;
			const i = draft.partners.findIndex((p) => p.id === id);
			if (i >= 0) draft.partners[i] = partner;
			else draft.partners.push(partner);
		});

		if (!existing) redirect(303, `/admin/partners?saved=${encodeURIComponent(m.added)}`);
		return { message: m.saved };
	},

	delete: async ({ params }) => {
		await update((draft) => {
			draft.partners = draft.partners.filter((p) => p.id !== params.id);
		});
		redirect(303, `/admin/partners?saved=${encodeURIComponent(msg().partner.removed)}`);
	}
};
