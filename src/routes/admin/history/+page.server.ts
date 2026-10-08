import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { historyRows } from '#lib/server/history.ts';
import { listBackups, restoreBackup } from '#lib/server/store.ts';
import { getUsers } from '#lib/server/auth.ts';
import { readLog } from '#lib/server/log.ts';
import { msg } from '#lib/server/lang.ts';

const PER_PAGE = 40;

export const load: PageServerLoad = async ({ url }) => {
	const all = url.searchParams.get('show') === 'all';
	const who = url.searchParams.get('who') ?? '';
	const pageNo = Math.max(1, Math.floor(Number(url.searchParams.get('page'))) || 1);

	const { rows, earlier } = await historyRows({ content: !all, who: who || undefined });
	const start = (pageNo - 1) * PER_PAGE;
	const more = rows.length > start + PER_PAGE;

	// Everyone who has made changes, including people who no longer have access
	const people = new Map((await getUsers()).map((u) => [u.id, u.name]));
	for (const e of await readLog()) if (e.by && !people.has(e.by.id)) people.set(e.by.id, e.by.name);

	return {
		rows: rows.slice(start, start + PER_PAGE),
		page: pageNo,
		more,
		all,
		who,
		people: [...people].map(([id, name]) => ({ id, name })),
		// Versions from before the log started, at the end of the list
		earlier: more || who ? [] : earlier.slice(0, 12)
	};
};

export const actions: Actions = {
	restore: async ({ request }) => {
		const name = String((await request.formData()).get('backup'));
		if (!(await listBackups()).some((b) => b.name === name)) error(404, 'Version not found');
		await restoreBackup(name);
		return { message: msg().history.restoredToast };
	}
};
