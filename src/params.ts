import { defineParams } from '@sveltejs/kit/params';

/** Matches a page's address in either language; the page's load redirects to the right one */
const either = (pt: string, en: string) => (param: string) => (param === pt || param === en ? param : undefined);

// The addresses are listed in PAGES in lib/i18n.ts
export const params = defineParams({
	/** English lives under /en, Portuguese at the root */
	lang: (param) => (param === 'en' ? 'en' : undefined),
	team: either('equipa', 'team'),
	drivers: either('pilotos', 'drivers'),
	season: either('temporada', 'season'),
	/** The news section is /noticias in Portuguese and /en/news in English */
	news: either('noticias', 'news'),
	/** The Hall of Fame is /hall-of-fame in both languages; the old /hall-da-fama redirects there */
	hall: either('hall-da-fama', 'hall-of-fame'),
	partners: either('parceiros', 'partners'),
	contact: either('contacto', 'contact'),
	/** The race calendar feed is /calendario.ics in Portuguese and /en/calendar.ics in English */
	calendar: either('calendario.ics', 'calendar.ics')
});
