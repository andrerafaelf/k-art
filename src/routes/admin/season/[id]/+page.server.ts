import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { numbered, type Result, type Round } from '#lib/content.ts';
import { getContent, update, newId } from '#lib/server/store.ts';
import { FormReader } from '#lib/server/form.ts';

const blank = (): Round => ({
	id: '',
	location: '',
	venue: { pt: '', en: '' },
	date: '',
	series: { pt: '', en: '' },
	results: []
});

export const load: PageServerLoad = async ({ params }) => {
	const { season, pilots } = await getContent();
	const round = params.id === 'new' ? blank() : numbered(season).find((r) => r.id === params.id);
	if (!round) error(404, 'Round not found');
	return {
		round,
		isNew: params.id === 'new',
		pilots: pilots.map((p) => ({ id: p.id, name: `${p.first} ${p.last}`, last: p.last, category: p.category })),
		locations: [...new Set(season.map((r) => r.location))]
	};
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const data = await request.formData();
		const f = new FormReader(data);
		const content = await getContent();
		const existing = content.season.find((r) => r.id === params.id);
		if (params.id !== 'new' && !existing) error(404, 'Round not found');

		const fields = {
			date: f.date('date'),
			location: f.text('location', { required: true, max: 40 }),
			venue: f.l('venue', { required: true, max: 80 }),
			series: f.l('series', { required: true, max: 60 })
		};

		// Results come in as parallel lists of driver and position
		const drivers = data.getAll('result_pilot').map(String);
		const positions = data.getAll('result_pos').map(String);
		const results: Result[] = [];
		drivers.forEach((pilotId, i) => {
			const pos = Number(positions[i]);
			if (!pilotId && !positions[i]) return;
			if (!pilotId) return f.error(`result_${i}`, 'Pick a driver');
			if (!Number.isInteger(pos) || pos < 1 || pos > 99) return f.error(`result_${i}`, 'Position must be 1 to 99');
			if (results.some((r) => r.pilotId === pilotId)) return f.error(`result_${i}`, 'This driver is already listed');
			const pilot = content.pilots.find((p) => p.id === pilotId);
			const before = existing?.results.find((r) => r.pilotId === pilotId);
			results.push({ pilotId, name: pilot?.last ?? before?.name ?? '?', pos });
		});
		if (results.length && new Date(fields.date).getTime() > Date.now()) {
			f.error('date', 'This round hasn’t happened yet, so it can’t have results');
		}
		if (!f.ok) return f.fail();

		const id = existing?.id ?? newId();
		await update((draft) => {
			const round: Round = { id, ...fields, results: results.sort((a, b) => a.pos - b.pos) };
			const i = draft.season.findIndex((r) => r.id === id);
			if (i >= 0) draft.season[i] = round;
			else draft.season.push(round);
		});

		if (!existing) redirect(303, `/admin/season/${id}?saved=${encodeURIComponent('Round added')}`);
		return { message: 'Round saved' };
	},

	delete: async ({ params }) => {
		await update((draft) => {
			draft.season = draft.season.filter((r) => r.id !== params.id);
		});
		redirect(303, `/admin/season?saved=${encodeURIComponent('Round removed')}`);
	}
};
