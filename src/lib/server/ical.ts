import { numbered, tr, type Content, type Lang } from '#lib/content.ts';
import { messages, localize } from '#lib/i18n.ts';

// The race calendar as an iCalendar feed (RFC 5545). Each round is an all-day
// event over the race weekend, so anyone subscribed sees every date the admin
// adds or moves, and the results once they are in.

/** Commas, semicolons, backslashes and line breaks are escaped in text values */
const text = (s: string) => s.replace(/[\\;,]/g, '\\$&').replace(/\r?\n/g, '\\n');

/** Lines are folded at 75 bytes, never inside a character; continuation lines start with a space */
function fold(line: string) {
	const out: string[] = [];
	let part = '';
	let bytes = 0;
	for (const ch of line) {
		const n = Buffer.byteLength(ch);
		if (bytes + n > (out.length ? 74 : 75)) {
			out.push(part);
			part = '';
			bytes = 0;
		}
		part += ch;
		bytes += n;
	}
	out.push(part);
	return out.join('\r\n ');
}

/** 2026-03-14 plus some days, as 20260314 */
const day = (iso: string, plus = 0) => {
	const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d + plus)).toISOString().slice(0, 10).replaceAll('-', '');
};

/** A moment in UTC, as 20261008T093000Z */
const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d+/g, '');

export function calendar({ season }: Content, lang: Lang, origin: string) {
	const t = messages[lang].calendar;
	const { host } = new URL(origin);
	const link = `${origin}${localize('/', lang)}#season`;
	// A published feed is stamped with the time it was generated
	const now = stamp(new Date().toISOString());

	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		`PRODID:-//K'ART Racing Team//${host}//${lang.toUpperCase()}`,
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		"X-WR-CALNAME:K'ART Racing Team",
		`X-WR-CALDESC:${text(t.description)}`,
		// How often Apple Calendar and Outlook check back; Google keeps its own schedule
		'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
		'X-PUBLISHED-TTL:PT6H'
	];

	for (const r of numbered(season)) {
		const results = [...r.results].sort((a, b) => a.pos - b.pos).map((x) => `P${x.pos} ${x.name}`);
		const notes = [tr(r.series, lang), results.length ? `${t.results}: ${results.join(', ')}` : '', link];
		lines.push(
			'BEGIN:VEVENT',
			// The round id, so a round that moves to another date moves in people's calendars too
			`UID:${r.id}@${host}`,
			`DTSTAMP:${now}`,
			// A race weekend is the start day and the one after, as in roundEnd
			`DTSTART;VALUE=DATE:${day(r.date)}`,
			`DTEND;VALUE=DATE:${day(r.date, 2)}`,
			`SUMMARY:${text(t.event(r.location, r.round))}`,
			`LOCATION:${text(`${tr(r.venue, lang)}, ${r.location}`)}`,
			`DESCRIPTION:${text(notes.filter(Boolean).join('\n'))}`,
			`URL:${link}`,
			'TRANSP:TRANSPARENT',
			'END:VEVENT'
		);
	}

	lines.push('END:VCALENDAR');
	return lines.map(fold).join('\r\n') + '\r\n';
}
