import type { Content } from '#lib/content.ts';
import type { Actor, Change, LogEntry } from '#lib/admin/changes.ts';
import { getContent, listBackups } from './store.ts';
import { readLog } from './log.ts';
import { getUsers } from './auth.ts';

// Turns change log entries into rows for the History page and the overview:
// links to the items that still exist, whether the version before each change
// can still be restored, and a colour per person.

export interface Row {
	id: string;
	at: string;
	by?: Actor;
	/** Colour of the person's initial, by the order accounts were made */
	tone?: number;
	changes: (Change & { href?: string })[];
	account?: LogEntry['account'];
	restored?: string;
	/** The saved version from before this change, when it is still kept */
	backup?: string;
	/** Several reorders in a row show as one */
	count: number;
}

const MERGE_WINDOW = 15 * 60_000;

function link(c: Change, content: Content): string | undefined {
	const has = (list: { id: string }[]) => !!c.id && list.some((x) => x.id === c.id);
	switch (c.kind) {
		case 'pilots':
			return c.op === 'move' ? '/admin/drivers' : has(content.pilots) ? `/admin/drivers/${c.id}` : undefined;
		case 'season':
			return has(content.season) ? `/admin/season/${c.id}` : undefined;
		case 'partners':
			return c.op === 'move' ? '/admin/partners' : has(content.partners) ? `/admin/partners/${c.id}` : undefined;
		case 'posts':
			return has(content.posts) ? `/admin/news/${c.id}` : undefined;
		case 'alumni':
			return c.op === 'move' ? '/admin/hall' : has(content.alumni) ? `/admin/hall/drivers/${c.id}` : undefined;
		case 'history':
			return has(content.history) ? `/admin/hall/seasons/${c.id}` : undefined;
		case 'settings':
			return '/admin/settings';
	}
}

const onlyMove = (e: LogEntry) => e.changes?.length === 1 && e.changes[0].op === 'move' && !e.restored;

/** Log entries, newest first, filtered and ready to show. */
export async function historyRows({ content = true, who }: { content?: boolean; who?: string } = {}) {
	const [log, current, backups, users] = await Promise.all([readLog(), getContent(), listBackups(), getUsers()]);
	const kept = new Set(backups.map((b) => b.name));
	const order = [...users].sort((a, b) => a.created.localeCompare(b.created)).map((u) => u.id);

	const rows: Row[] = [];
	let newer: LogEntry | undefined;
	for (let i = log.length - 1; i >= 0; i--) {
		const e = log[i];
		if (content && !e.changes) continue;
		if (who && e.by?.id !== who) continue;

		const prev = rows.at(-1);
		if (
			prev &&
			newer &&
			onlyMove(e) &&
			onlyMove(newer) &&
			e.changes![0].kind === newer.changes![0].kind &&
			e.by?.id === newer.by?.id &&
			Date.parse(newer.at) - Date.parse(e.at) < MERGE_WINDOW
		) {
			// Going back to before the earliest of the reorders undoes them all
			prev.count++;
			prev.backup = e.backup && kept.has(e.backup) ? e.backup : undefined;
			newer = e;
			continue;
		}

		const tone = e.by ? order.indexOf(e.by.id) : -1;
		rows.push({
			id: e.id,
			at: e.at,
			by: e.by,
			tone: tone >= 0 ? tone : undefined,
			changes: (e.changes ?? []).map((c) => ({ ...c, href: link(c, current) })),
			account: e.account,
			restored: e.restored,
			backup: e.backup && kept.has(e.backup) ? e.backup : undefined,
			count: 1
		});
		newer = e;
	}

	// Saved versions from before the log existed, so they can still be restored
	const referenced = new Set(log.map((e) => e.backup).filter(Boolean));
	const earlier = backups
		.filter((b) => !referenced.has(b.name))
		.map((b) => ({ name: b.name, saved: b.saved.toISOString() }));

	return { rows, earlier };
}

/** The latest change to the site, for the sidebar. */
export async function lastSave() {
	const log = await readLog();
	for (let i = log.length - 1; i >= 0; i--) {
		if (log[i].changes) return { name: log[i].by?.name, at: log[i].at };
	}
}
