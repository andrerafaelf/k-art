import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { slugify, type Alumnus } from '#lib/content.ts';
import { getContent, update, newId } from '#lib/server/store.ts';
import { FormReader } from '#lib/server/form.ts';
import { readImage } from '#lib/server/images.ts';
import { msg } from '#lib/server/lang.ts';
import { revision } from '#lib/server/revision.ts';

const blank = (year: number): Alumnus => ({
	id: '',
	number: 0,
	first: '',
	last: '',
	accent: 'lime',
	from: year - 1,
	to: year - 1,
	categories: '',
	record: { starts: 0, wins: 0, podiums: 0, poles: 0 },
	titles: { pt: [], en: [] },
	now: { pt: '', en: '' }
});

export const load: PageServerLoad = async ({ params }) => {
	const { alumni, settings } = await getContent();
	const a = params.id === 'new' ? blank(settings.seasonYear) : alumni.find((x) => x.id === params.id);
	if (!a) error(404, 'Driver not found');
	return { a, isNew: params.id === 'new', rev: params.id === 'new' ? undefined : revision(a) };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const f = new FormReader(await request.formData());
		const content = await getContent();
		const existing = content.alumni.find((x) => x.id === params.id);
		if (params.id !== 'new' && !existing) error(404, 'Driver not found');
		const m = msg();

		const year = new Date().getFullYear();
		const fields = {
			first: f.text('first', { required: true, max: 40 }),
			last: f.text('last', { required: true, max: 40 }),
			number: f.int('number', { min: 0, max: 999 }),
			accent: f.choice('accent', ['lime', 'cyan'] as const, 'lime'),
			from: f.int('from', { min: 1990, max: year + 1 }),
			to: f.int('to', { min: 1990, max: year + 1 }),
			categories: f.text('categories', { required: true, max: 80 }),
			record: {
				starts: f.int('starts', { min: 0, max: 9999 }),
				wins: f.int('wins', { min: 0, max: 9999 }),
				podiums: f.int('podiums', { min: 0, max: 9999 }),
				poles: f.int('poles', { min: 0, max: 9999 })
			},
			titles: f.lines('titles', { maxLines: 8, max: 140 }),
			now: f.l('now', { max: 80 })
		};
		if (fields.to < fields.from) f.error('to', m.alumnus.toBeforeFrom);
		if (fields.record.podiums < fields.record.wins) f.error('podiums', m.errors.podiums);
		if (!f.ok) return f.fail();
		const conflict = await f.conflict(existing, 'alumni', existing?.id);
		if (conflict) return conflict;

		const photo = await readImage(f, 'photo', existing?.photo);
		if (!f.ok) return f.fail();

		let id = existing?.id ?? slugify(`${fields.first}-${fields.last}`);
		if (!existing && content.alumni.some((x) => x.id === id)) id = `${id}-${newId()}`;

		await update((draft) => {
			const a: Alumnus = { id, ...fields, photo };
			if (!a.photo) delete a.photo;
			const i = draft.alumni.findIndex((x) => x.id === id);
			if (i >= 0) draft.alumni[i] = a;
			else draft.alumni.push(a);
		});

		if (!existing) redirect(303, `/admin/hall?saved=${encodeURIComponent(m.alumnus.added)}`);
		return { message: m.alumnus.saved };
	},

	delete: async ({ params }) => {
		await update((draft) => {
			draft.alumni = draft.alumni.filter((x) => x.id !== params.id);
		});
		redirect(303, `/admin/hall?saved=${encodeURIComponent(msg().alumnus.removed)}`);
	}
};
