// Content model shared by the public site and the admin, plus the helpers
// that derive stats from it. Nothing here touches the server.

export type Lang = 'pt' | 'en';
export const LANGS: Lang[] = ['pt', 'en'];

/** Text the admin writes in both languages. */
export type L<T = string> = { pt: T; en: T };

const filled = (v: unknown) => (Array.isArray(v) ? v.some((x) => String(x).trim()) : !!String(v ?? '').trim());

/** Picks the requested language, falling back to the other one when it is empty. */
export function tr<T>(value: L<T> | undefined, lang: Lang): T {
	if (!value) return '' as T;
	const other: Lang = lang === 'pt' ? 'en' : 'pt';
	return filled(value[lang]) ? value[lang] : value[other];
}

export type Accent = 'lime' | 'cyan';
export type Zone = 'pods' | 'nassau' | 'nose' | 'bumper';

export interface Pilot {
	id: string;
	number: number;
	first: string;
	last: string;
	category: string;
	age: number;
	hometown: string;
	since: number;
	chassis: string;
	engine: string;
	accent: Accent;
	/** Uploaded portrait, e.g. '/uploads/abc123.jpg' */
	photo?: string;
	/** Career record, entered by hand so it can include results from before the team */
	record: { starts: number; wins: number; podiums: number; poles: number };
	best: L;
	quote: L;
}

export interface Result {
	pilotId: string;
	/** Surname at the time of the result, kept so results survive a driver being removed */
	name: string;
	pos: number;
}

export interface Round {
	id: string;
	/** Town or region, shown large */
	location: string;
	venue: L;
	/** ISO date of the first day of the race weekend */
	date: string;
	series: L;
	results: Result[];
}

export interface Partner {
	id: string;
	name: string;
	url?: string;
	logo: string;
	/** Tile colour behind the logo, pick whichever the logo reads best on */
	tone: 'dark' | 'light';
}

export interface Post {
	id: string;
	slug: string;
	title: L;
	date: string;
	excerpt: L;
	body: L;
	cover?: string;
	published: boolean;
}

export interface Package {
	zone: Zone;
	tier: L;
	title: L;
	body: L;
}

export interface Settings {
	seasonYear: number;
	email: string;
	instagram: string;
	location: string;
	heroEyebrow: L;
	heroLines: L<string[]>;
	heroLead: L;
	seasonIntro: L;
	partnersIntro: L;
	packages: Package[];
	tryouts: L;
	press: L;
}

/** A former driver, in the Hall of Fame */
export interface Alumnus {
	id: string;
	number: number;
	first: string;
	last: string;
	accent: Accent;
	/** Seasons with the team */
	from: number;
	to: number;
	/** Classes raced with the team, for example "Júnior X30, Sénior X30" */
	categories: string;
	photo?: string;
	/** Record with the team */
	record: { starts: number; wins: number; podiums: number; poles: number };
	/** One title or highlight per line */
	titles: L<string[]>;
	/** Where they race now */
	now: L;
}

/** A finished season, in the Hall of Fame */
export interface SeasonArchive {
	id: string;
	year: number;
	headline: L;
	summary: L;
	stats: { rounds: number; wins: number; podiums: number; poles: number };
	/** One title per line, for example "Beatriz Gouveia, Campeã Regional Júnior X30" */
	titles: L<string[]>;
	/** Drivers that season, comma separated */
	lineup: string;
}

export interface Content {
	settings: Settings;
	pilots: Pilot[];
	season: Round[];
	partners: Partner[];
	posts: Post[];
	alumni: Alumnus[];
	history: SeasonArchive[];
	updatedAt: string;
}

export const ZONES: Zone[] = ['pods', 'nassau', 'nose', 'bumper'];

// ---------- season ----------

export interface NumberedRound extends Round {
	round: number;
}

/** Rounds in date order, numbered from 1. */
export const numbered = (season: Round[]): NumberedRound[] =>
	[...season].sort((a, b) => a.date.localeCompare(b.date)).map((r, i) => ({ ...r, round: i + 1 }));

/** Race weekends are treated as finished at the end of their start day + 1. */
export const roundEnd = (r: Round) => new Date(r.date).getTime() + 2 * 86_400_000;

export const nextRound = (season: NumberedRound[], now: number) => season.find((r) => roundEnd(r) > now);

export const daysUntil = (r: Round, now: number) =>
	Math.ceil((new Date(r.date).getTime() - now) / 86_400_000);

export const bestResult = (r: Round) =>
	r.results.length ? r.results.reduce((a, b) => (b.pos < a.pos ? b : a)) : undefined;

/** Results so far, counted from every driver result entered in the calendar. */
export const seasonSummary = (season: Round[]) => {
	const raced = season.filter((r) => r.results.length);
	const all = raced.flatMap((r) => r.results);
	return {
		raced: raced.length,
		wins: all.filter((r) => r.pos === 1).length,
		podiums: all.filter((r) => r.pos <= 3).length,
		podiumRounds: raced.filter((r) => r.results.some((x) => x.pos <= 3)).length
	};
};

// ---------- drivers ----------

/** Career totals across the whole line-up. */
export const teamRecord = (pilots: Pilot[]) =>
	pilots.reduce(
		(t, p) => ({
			starts: t.starts + p.record.starts,
			wins: t.wins + p.record.wins,
			podiums: t.podiums + p.record.podiums,
			poles: t.poles + p.record.poles
		}),
		{ starts: 0, wins: 0, podiums: 0, poles: 0 }
	);

/** Three-letter timing-screen code: Nóbrega becomes NOB */
export const code3 = (last: string) =>
	last
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z]/gi, '')
		.slice(0, 3)
		.toUpperCase();

// ---------- hall of fame ----------

/** Seasons newest first */
export const byYear = (history: SeasonArchive[]) => [...history].sort((a, b) => b.year - a.year);

/** Totals across every archived season */
export const hallTotals = (history: SeasonArchive[], alumni: Alumnus[]) => ({
	seasons: history.length,
	wins: history.reduce((n, s) => n + s.stats.wins, 0),
	podiums: history.reduce((n, s) => n + s.stats.podiums, 0),
	titles: history.reduce((n, s) => n + s.titles.pt.filter((t) => t.trim()).length, 0),
	alumni: alumni.length
});

// ---------- text ----------

export const slugify = (s: string) =>
	s
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80) || 'post';

// Dates are formatted by hand so server and browser always agree
const MONTHS: L<string[]> = {
	en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
};
const WEEKDAYS: L<string[]> = {
	en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	pt: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
};

const parts = (iso: string) => {
	const d = new Date(iso);
	return { day: d.getUTCDate(), month: d.getUTCMonth(), year: d.getUTCFullYear(), weekday: d.getUTCDay() };
};

/** "Oct" / "out" */
export const monthShort = (iso: string, lang: Lang) => {
	const m = MONTHS[lang][parts(iso).month].slice(0, 3);
	return lang === 'en' ? m : m.toLowerCase();
};

/** "17 Oct" / "17 out" */
export const shortDate = (iso: string, lang: Lang) => `${parts(iso).day} ${monthShort(iso, lang)}`;

/** "17 October 2026" / "17 de outubro de 2026" */
export const longDate = (iso: string, lang: Lang, { year = true, weekday = false } = {}) => {
	const p = parts(iso);
	const month = MONTHS[lang][p.month];
	if (lang === 'pt') {
		const wd = weekday ? `${WEEKDAYS.pt[p.weekday]}, ` : '';
		return `${wd}${p.day} de ${month}${year ? ` de ${p.year}` : ''}`;
	}
	const wd = weekday ? `${WEEKDAYS.en[p.weekday]} ` : '';
	return `${wd}${p.day} ${month}${year ? ` ${p.year}` : ''}`;
};
