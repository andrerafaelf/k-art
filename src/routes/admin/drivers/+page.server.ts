import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getContent, update } from '#lib/server/store.ts';
import { msg } from '#lib/server/lang.ts';

export const load: PageServerLoad = async () => {
	const { pilots } = await getContent();
	return { pilots };
};

export const actions: Actions = {
	move: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id'));
		const dir = data.get('dir') === 'up' ? -1 : 1;
		await update((draft) => {
			const i = draft.pilots.findIndex((p) => p.id === id);
			if (i < 0) error(404, 'Driver not found');
			const j = i + dir;
			if (j < 0 || j >= draft.pilots.length) return;
			[draft.pilots[i], draft.pilots[j]] = [draft.pilots[j], draft.pilots[i]];
		});
		return { message: msg().common.orderSaved };
	}
};
