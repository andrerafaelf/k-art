import { defineParams } from '@sveltejs/kit/params';

export const params = defineParams({
	/** English lives under /en, Portuguese at the root */
	lang: (param) => (param === 'en' ? 'en' : undefined),
	/** The news section is /noticias in Portuguese and /en/news in English */
	news: (param) => (param === 'noticias' || param === 'news' ? param : undefined),
	/** The Hall of Fame is /hall-of-fame in both languages; the old /hall-da-fama redirects there */
	hall: (param) => (param === 'hall-da-fama' || param === 'hall-of-fame' ? param : undefined)
});
