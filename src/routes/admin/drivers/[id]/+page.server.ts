import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { slugify, driverSeason, type Alumnus, type Pilot } from '#lib/content.ts';
import { COUNTRIES, DEFAULT_COUNTRY } from '#lib/flags.ts';
import { getContent, update, newId } from '#lib/server/store.ts';
import { FormReader } from '#lib/server/form.ts';
import { readImage } from '#lib/server/images.ts';
import { msg } from '#lib/server/lang.ts';
import { revision } from '#lib/server/revision.ts';

const blank = (): Pilot => ({
	id: '',
	number: 0,
	first: '',
	last: '',
	category: '',
	age: 0,
	hometown: '',
	since: new Date().getFullYear(),
	chassis: '',
	engine: '',
	accent: 'lime',
	country: DEFAULT_COUNTRY
});

export const load: PageServerLoad = async ({ params }) => {
	const { pilots } = await getContent();
	const pilot = params.id === 'new' ? blank() : pilots.find((p) => p.id === params.id);
	if (!pilot) error(404, 'Driver not found');
	return {
		pilot,
		isNew: params.id === 'new',
		rev: params.id === 'new' ? undefined : revision(pilot),
		categories: [...new Set(pilots.map((p) => p.category))]
	};
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const f = new FormReader(await request.formData());
		const content = await getContent();
		const existing = content.pilots.find((p) => p.id === params.id);
		if (params.id !== 'new' && !existing) error(404, 'Driver not found');
		const m = msg();

		const year = new Date().getFullYear();
		const fields = {
			first: f.text('first', { required: true, max: 40 }),
			last: f.text('last', { required: true, max: 40 }),
			number: f.int('number', { min: 0, max: 999 }),
			accent: f.choice('accent', ['lime', 'cyan'] as const, 'lime'),
			category: f.text('category', { required: true, max: 40 }),
			country: f.choice('country', COUNTRIES, DEFAULT_COUNTRY),
			age: f.int('age', { min: 4, max: 99 }),
			hometown: f.text('hometown', { max: 60 }),
			since: f.int('since', { min: 1950, max: year }),
			chassis: f.text('chassis', { max: 60 }),
			engine: f.text('engine', { max: 60 })
		};

		const clash = content.pilots.find((p) => p.number === fields.number && p.id !== existing?.id);
		if (clash) f.error('number', m.driver.numberTaken(fields.number, `${clash.first} ${clash.last}`));
		if (!f.ok) return f.fail();
		const conflict = await f.conflict(existing, 'pilots', existing?.id);
		if (conflict) return conflict;

		const photo = await readImage(f, 'photo', existing?.photo);
		if (!f.ok) return f.fail();

		let id = existing?.id ?? slugify(`${fields.first}-${fields.last}`);
		if (!existing && content.pilots.some((p) => p.id === id)) id = `${id}-${newId()}`;

		await update((draft) => {
			const pilot: Pilot = { id, ...fields, photo };
			if (!pilot.photo) delete pilot.photo;
			const i = draft.pilots.findIndex((p) => p.id === id);
			if (i >= 0) draft.pilots[i] = pilot;
			else draft.pilots.push(pilot);
			// Keep the name on past results in step with the driver
			for (const round of draft.season) {
				for (const result of round.results) if (result.pilotId === id) result.name = fields.last;
			}
		});

		if (!existing) redirect(303, `/admin/drivers/${id}?saved=${encodeURIComponent(m.driver.added)}`);
		return { message: m.driver.saved };
	},

	delete: async ({ params }) => {
		await update((draft) => {
			draft.pilots = draft.pilots.filter((p) => p.id !== params.id);
		});
		redirect(303, `/admin/drivers?saved=${encodeURIComponent(msg().driver.removed)}`);
	},

	/** Takes a driver out of the line-up and into the Hall of Fame */
	retire: async ({ params }) => {
		let id = '';
		await update((draft) => {
			const p = draft.pilots.find((x) => x.id === params.id);
			if (!p) error(404, 'Driver not found');
			const year = draft.settings.seasonYear;
			id = draft.alumni.some((a) => a.id === p.id) ? `${p.id}-${newId()}` : p.id;
			const { best: _, ...results } = driverSeason(draft.season, p.id);
			const alumnus: Alumnus = {
				id,
				number: p.number,
				first: p.first,
				last: p.last,
				accent: p.accent,
				from: year,
				to: year,
				categories: p.category,
				photo: p.photo,
				// This season's results from the calendar, to check and add to by hand
				record: { ...results, poles: 0 },
				titles: { pt: [], en: [] },
				now: { pt: '', en: '' }
			};
			if (!alumnus.photo) delete alumnus.photo;
			draft.alumni.push(alumnus);
			draft.pilots = draft.pilots.filter((x) => x.id !== p.id);
		});
		redirect(303, `/admin/hall/drivers/${id}?saved=${encodeURIComponent(msg().driver.retired)}`);
	}
};
