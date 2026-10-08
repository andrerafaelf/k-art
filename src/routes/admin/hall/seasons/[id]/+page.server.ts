import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { seasonSummary, type SeasonArchive } from '#lib/content.ts';
import { getContent, update, newId } from '#lib/server/store.ts';
import { FormReader } from '#lib/server/form.ts';
import { msg } from '#lib/server/lang.ts';
import { revision } from '#lib/server/revision.ts';

const blank = (year: number): SeasonArchive => ({
	id: '',
	year,
	headline: { pt: '', en: '' },
	summary: { pt: '', en: '' },
	stats: { rounds: 0, wins: 0, podiums: 0, poles: 0 },
	titles: { pt: [], en: [] },
	lineup: ''
});

export const load: PageServerLoad = async ({ params, url }) => {
	const { history, settings, season, pilots } = await getContent();
	if (params.id !== 'new') {
		const s = history.find((h) => h.id === params.id);
		if (!s) error(404, 'Season not found');
		return { s, isNew: false, fromCalendar: false, rev: revision(s) };
	}

	const s = blank(settings.seasonYear);
	const fromCalendar = url.searchParams.get('from') === 'calendar';
	if (fromCalendar) {
		// Start from what the calendar already knows about this season
		const summary = seasonSummary(season);
		s.stats = { rounds: season.length, wins: summary.wins, podiums: summary.podiums, poles: 0 };
		s.lineup = pilots.map((p) => p.last).join(', ');
	}
	return { s, isNew: true, fromCalendar, rev: undefined };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const f = new FormReader(await request.formData());
		const content = await getContent();
		const existing = content.history.find((h) => h.id === params.id);
		if (params.id !== 'new' && !existing) error(404, 'Season not found');
		const m = msg();

		const year = new Date().getFullYear();
		const fields = {
			year: f.int('year', { min: 1990, max: year + 1 }),
			headline: f.l('headline', { required: true, max: 60 }),
			summary: f.l('summary', { max: 500 }),
			stats: {
				rounds: f.int('rounds', { min: 0, max: 99 }),
				wins: f.int('wins', { min: 0, max: 999 }),
				podiums: f.int('podiums', { min: 0, max: 999 }),
				poles: f.int('poles', { min: 0, max: 999 })
			},
			titles: f.lines('titles', { maxLines: 12, max: 140 }),
			lineup: f.text('lineup', { max: 300 })
		};
		if (fields.stats.podiums < fields.stats.wins) f.error('podiums', m.errors.podiums);
		if (content.history.some((h) => h.year === fields.year && h.id !== existing?.id)) {
			f.error('year', m.archive.taken(fields.year));
		}
		if (!f.ok) return f.fail();
		const conflict = await f.conflict(existing, 'history', existing?.id);
		if (conflict) return conflict;

		const id = existing?.id ?? `s${fields.year}-${newId()}`;
		await update((draft) => {
			const s: SeasonArchive = { id, ...fields };
			const i = draft.history.findIndex((h) => h.id === id);
			if (i >= 0) draft.history[i] = s;
			else draft.history.push(s);
		});

		if (!existing) redirect(303, `/admin/hall?saved=${encodeURIComponent(m.archive.added(fields.year))}`);
		return { message: m.archive.saved };
	},

	delete: async ({ params }) => {
		await update((draft) => {
			draft.history = draft.history.filter((h) => h.id !== params.id);
		});
		redirect(303, `/admin/hall?saved=${encodeURIComponent(msg().archive.removed)}`);
	}
};
