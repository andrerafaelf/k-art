import type { RequestHandler } from './$types';
import { getContent } from '#lib/server/store.ts';
import { calendar } from '#lib/server/ical.ts';

// The race calendar feed that people subscribe to from the season section:
// /calendario.ics in Portuguese and /en/calendar.ics in English.

export const GET: RequestHandler = async ({ params, url }) =>
	new Response(calendar(await getContent(), params.lang === 'en' ? 'en' : 'pt', url.origin), {
		headers: {
			'content-type': 'text/calendar; charset=utf-8',
			// Calendar apps poll this, so a short cache is plenty
			'cache-control': 'public, max-age=900'
		}
	});
