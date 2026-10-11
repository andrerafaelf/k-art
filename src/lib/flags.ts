import type { Lang } from '#lib/content.ts';

// Country flags from the flag-icons package (MIT). Each flag is its own file
// in the build, so a page only downloads the flags it shows. Country names
// come from the browser's and Node's own country name data (Intl), in
// Portuguese or English, so there is no list of names to keep up to date.

const DIR = '/node_modules/flag-icons/flags/4x3/';

const files = import.meta.glob<string>('/node_modules/flag-icons/flags/4x3/*.svg', {
	eager: true,
	query: '?url&no-inline',
	import: 'default'
});

/** Every driver is Portuguese until the admin picks another country */
export const DEFAULT_COUNTRY = 'pt';

const names: Partial<Record<Lang, Intl.DisplayNames>> = {};

/** "Portugal", "Reino Unido" / "United Kingdom"; the code itself if there is no name for it */
export function countryName(code: string, lang: Lang) {
	names[lang] ??= new Intl.DisplayNames([lang === 'pt' ? 'pt-PT' : 'en-GB'], { type: 'region', fallback: 'code' });
	return names[lang].of(code.toUpperCase()) ?? code.toUpperCase();
}

/**
 * Countries that have a flag, by ISO code: two letters, leaving out flag-icons'
 * regions and organisations (England, Catalonia, the EU, the UN and the like).
 */
export const COUNTRIES = Object.keys(files)
	.map((file) => file.slice(DIR.length, -'.svg'.length))
	.filter((code) => /^[a-z]{2}$/.test(code) && !['eu', 'un', 'xx'].includes(code))
	.filter((code) => countryName(code, 'en') !== code.toUpperCase());

/** Address of a country's flag, 4:3; Portugal's for a code without one */
export const flagUrl = (code: string | undefined) =>
	files[`${DIR}${code}.svg`] ?? files[`${DIR}${DEFAULT_COUNTRY}.svg`];
