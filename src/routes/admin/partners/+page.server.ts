import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getContent, update } from '#lib/server/store.ts';

export const load: PageServerLoad = async () => {
	const { partners } = await getContent();
	return { partners };
};

export const actions: Actions = {
	move: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id'));
		const dir = data.get('dir') === 'up' ? -1 : 1;
		await update((draft) => {
			const i = draft.partners.findIndex((p) => p.id === id);
			if (i < 0) error(404, 'Partner not found');
			const j = i + dir;
			if (j < 0 || j >= draft.partners.length) return;
			[draft.partners[i], draft.partners[j]] = [draft.partners[j], draft.partners[i]];
		});
		return { message: 'Order saved' };
	}
};
