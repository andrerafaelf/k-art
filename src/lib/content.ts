// Content model shared by the public site and the admin, plus the helpers
// that derive stats from it. Nothing here touches the server.

import type { Texts } from './texts.ts';

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

/** Driver colour. 'cyan' is the team blue; the name is older than the colour and is kept so saved content stays valid */
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
	/** Nationality as a lowercase ISO country code, 'pt' unless the admin picks another */
	country: string;
	/** Uploaded portrait, e.g. '/uploads/abc123.jpg' */
	photo?: string;
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
	/** How many days the weekend lasts, from 1 to 4; usually 2 */
	days: number;
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

/** Contact details and the season year; everything written on the pages is in Texts (lib/texts.ts) */
export interface Settings {
	seasonYear: number;
	email: string;
	instagram: string;
	location: string;
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
	/** What the pages say, edited in the admin's Site texts */
	texts: Texts;
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

export const RACE_DAYS = [1, 2, 3, 4] as const;
/** Most race weekends are Saturday and Sunday */
export const DEFAULT_RACE_DAYS = 2;

const DAY = 86_400_000;

/** Days the weekend lasts, kept between 1 and 4 */
export const raceDays = (r: Pick<Round, 'days'>) => Math.min(Math.max(Math.round(r.days) || DEFAULT_RACE_DAYS, 1), 4);

/** ISO date of the last day of the race weekend */
export const lastDay = (r: Pick<Round, 'date' | 'days'>) =>
	new Date(new Date(r.date).getTime() + (raceDays(r) - 1) * DAY).toISOString().slice(0, 10);

/** A round is finished once its last day is over. */
export const roundEnd = (r: Pick<Round, 'date' | 'days'>) => new Date(r.date).getTime() + raceDays(r) * DAY;

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

/** A driver's results this season, counted from the calendar. */
export const driverSeason = (season: Round[], pilotId: string) => {
	const results = season.flatMap((r) => r.results.filter((x) => x.pilotId === pilotId));
	return {
		starts: results.length,
		wins: results.filter((x) => x.pos === 1).length,
		podiums: results.filter((x) => x.pos <= 3).length,
		best: results.length ? Math.min(...results.map((x) => x.pos)) : undefined
	};
};


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

// ---------- news ----------

/** Today's date in Madeira, as YYYY-MM-DD */
export const madeiraToday = (now = Date.now()) =>
	new Intl.DateTimeFormat('en-CA', { timeZone: 'Atlantic/Madeira' }).format(now);

/** Published, and its date has come: a published post with a future date waits until that day. */
export const isLive = (post: Post, now = Date.now()) => post.published && post.date <= madeiraToday(now);

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

/** "17-18 Oct", "31 Oct - 1 Nov" / "17-18 out", "31 out - 1 nov"; one day as shortDate */
export const shortRange = (r: Pick<Round, 'date' | 'days'>, lang: Lang) => {
	if (raceDays(r) === 1) return shortDate(r.date, lang);
	const end = lastDay(r);
	const [a, b] = [parts(r.date), parts(end)];
	return a.month === b.month ? `${a.day}-${b.day} ${monthShort(r.date, lang)}` : `${shortDate(r.date, lang)} - ${shortDate(end, lang)}`;
};

/** The days of the weekend, "17-18" or "31-01", and its month, "out" or "out-nov", for a calendar column */
export const dayRange = (r: Pick<Round, 'date' | 'days'>, lang: Lang) => {
	const end = lastDay(r);
	const [a, b] = [parts(r.date), parts(end)];
	const pad = (n: number) => String(n).padStart(2, '0');
	if (raceDays(r) === 1) return { days: pad(a.day), month: monthShort(r.date, lang) };
	return {
		days: `${pad(a.day)}-${pad(b.day)}`,
		month: a.month === b.month ? monthShort(r.date, lang) : `${monthShort(r.date, lang)}-${monthShort(end, lang)}`
	};
};

/**
 * The whole weekend in words: "sábado e domingo, 17 e 18 de outubro",
 * "sexta-feira a domingo, 30 de outubro a 1 de novembro"; one day as longDate.
 */
export const longRange = (r: Pick<Round, 'date' | 'days'>, lang: Lang, { year = true, weekday = false } = {}) => {
	const n = raceDays(r);
	if (n === 1) return longDate(r.date, lang, { year, weekday });
	const [a, b] = [parts(r.date), parts(lastDay(r))];
	const and = n === 2 ? (lang === 'pt' ? ' e ' : ' and ') : lang === 'pt' ? ' a ' : ' to ';
	const M = MONTHS[lang];
	const of = lang === 'pt' ? ' de ' : ' ';
	const days =
		a.month === b.month
			? `${a.day}${and}${b.day}${of}${M[a.month]}`
			: `${a.day}${of}${M[a.month]}${and}${b.day}${of}${M[b.month]}`;
	const wd = weekday ? `${WEEKDAYS[lang][a.weekday]}${and}${WEEKDAYS[lang][b.weekday]}, ` : '';
	return `${wd}${days}${year ? `${of}${b.year}` : ''}`;
};

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
