import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getContent, update } from '#lib/server/store.ts';
import { FormReader } from '#lib/server/form.ts';
import { msg } from '#lib/server/lang.ts';
import { revision } from '#lib/server/revision.ts';
import { group as findGroup, type Texts, type TextKey } from '#lib/texts.ts';

/** This page's texts only, so two people editing different pages don't trip over each other */
const subset = (texts: Texts, keys: string[]) => Object.fromEntries(keys.map((k) => [k, texts[k as TextKey]]));

export const load: PageServerLoad = async ({ params }) => {
	const g = findGroup(params.group);
	if (!g) error(404, 'Page not found');
	const { texts } = await getContent();
	const keys = g.fields.map((f) => f.key as string);
	return { id: g.id, values: subset(texts, keys), rev: revision(subset(texts, keys)) };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const g = findGroup(params.group);
		if (!g) error(404, 'Page not found');
		const f = new FormReader(await request.formData());

		const values: Texts = {};
		for (const field of g.fields) {
			const key = field.key as TextKey;
			values[key] =
				field.kind === 'lines'
					? f.lines(key, { required: true, maxLines: field.maxLines ?? 3, max: field.max })
					: f.l(key, { required: true, max: field.max });
		}
		if (!f.ok) return f.fail();
		const keys = g.fields.map((x) => x.key as string);
		const conflict = await f.conflict(subset((await getContent()).texts, keys), 'texts');
		if (conflict) return conflict;

		await update((draft) => {
			draft.texts = { ...draft.texts, ...values };
		});
		return { message: msg().texts.saved };
	}
};
