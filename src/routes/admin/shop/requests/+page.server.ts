import type { PageServerLoad } from './$types';
import { getRequests } from '#lib/server/requests.ts';

export const load: PageServerLoad = async ({ url }) => {
	const all = await getRequests();
	const everything = url.searchParams.has('all');
	return {
		requests: (everything ? all : all.filter((r) => r.status !== 'done')).map(({ lines, message: _, ...r }) => ({
			...r,
			items: lines.reduce((n, l) => n + l.qty, 0)
		})),
		everything,
		open: all.filter((r) => r.status !== 'done').length,
		total: all.length
	};
};
