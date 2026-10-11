import fs from 'node:fs/promises';
import path from 'node:path';
import { getRequestEvent } from '$app/server';
import type { Actor, LogEntry } from '#lib/admin/changes.ts';
import { dataDir, newId } from './files.ts';

// The change log: one line of JSON per entry, only ever appended to, so it
// keeps a full record of who did what. It is read once and then kept in memory.

const file = path.join(dataDir, 'changelog.jsonl');

let cache: Promise<LogEntry[]> | undefined;
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<LogEntry[]> {
	let text: string;
	try {
		text = await fs.readFile(file, 'utf8');
	} catch (e) {
		if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
		throw e;
	}
	const entries: LogEntry[] = [];
	for (const line of text.split('\n')) {
		if (!line.trim()) continue;
		try {
			entries.push(JSON.parse(line));
		} catch {
			// A line cut short by a crash; the rest of the log is still good
		}
	}
	return entries;
}

/** Every entry, oldest first. */
export function readLog(): Promise<LogEntry[]> {
	cache ??= load().catch((e) => {
		cache = undefined;
		throw e;
	});
	return cache;
}

/** The signed-in person behind the current request, if there is one. */
export function actor(): Actor | undefined {
	try {
		const user = getRequestEvent().locals.user;
		return user && { id: user.id, name: user.name };
	} catch {
		return undefined;
	}
}

/** Adds an entry. Without `by` it is credited to whoever made the current request. */
export function record(entry: Omit<LogEntry, 'id' | 'at'>): Promise<void> {
	const full: LogEntry = { id: newId(), at: new Date().toISOString(), by: actor(), ...entry };
	if (!full.by) delete full.by;
	const run = queue.then(async () => {
		const entries = await readLog();
		await fs.mkdir(dataDir, { recursive: true });
		await fs.appendFile(file, `${JSON.stringify(full)}\n`);
		entries.push(full);
	});
	queue = run.catch(() => {});
	return run;
}

/** The latest change to one item, to say who got there first when two edits collide. */
export async function lastChange(kind: string, id?: string) {
	const entries = await readLog();
	for (let i = entries.length - 1; i >= 0; i--) {
		const e = entries[i];
		if (e.changes?.some((c) => c.kind === kind && (kind === 'settings' || kind === 'texts' || c.id === id))) return e;
	}
}
