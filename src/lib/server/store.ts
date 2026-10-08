import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import type { Content } from '#lib/content.ts';
import { diff } from '#lib/admin/changes.ts';
import { seed } from './seed.ts';
import { dataDir, writeAtomic } from './files.ts';
import { actor, record } from './log.ts';
import { stripLocation } from './exif.ts';
import { msg } from './lang.ts';

export { newId } from './files.ts';

// All site content lives in one JSON file. Every save is written atomically,
// the previous version is kept in backups/ and the change goes in the change
// log, so any edit can be traced and undone.

const file = path.join(dataDir, 'content.json');
const backups = path.join(dataDir, 'backups');
export const uploads = path.join(dataDir, 'uploads');

const DAY = 86_400_000;

let cache: Promise<Content> | undefined;
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Content> {
	try {
		return normalize(JSON.parse(await fs.readFile(file, 'utf8')));
	} catch (e) {
		if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
		const fresh = seed();
		await write(fresh);
		return fresh;
	}
}

/** Fills in anything missing, so older data files keep working as the model grows. */
function normalize(raw: Partial<Content>): Content {
	const base = seed();
	return {
		settings: { ...base.settings, ...raw.settings },
		pilots: raw.pilots ?? [],
		season: raw.season ?? [],
		partners: raw.partners ?? [],
		posts: raw.posts ?? [],
		alumni: raw.alumni ?? base.alumni,
		history: raw.history ?? base.history,
		updatedAt: raw.updatedAt ?? base.updatedAt
	};
}

const write = (content: Content) => writeAtomic(file, JSON.stringify(content, null, '\t'));

/** Loaded once and shared, so requests arriving together on a fresh install don't race to create the file. */
export function getContent(): Promise<Content> {
	cache ??= load().catch((e) => {
		cache = undefined;
		throw e;
	});
	return cache;
}

/**
 * Applies a change and saves it. Changes run one at a time, each on a fresh
 * copy, so a failed edit never leaves half-written data behind. A save that
 * changes nothing is skipped, so it doesn't fill the history.
 */
export function update(
	change: (draft: Content) => void | Promise<void>,
	{ restored }: { restored?: string } = {}
): Promise<Content> {
	const by = actor();
	const run = queue.then(async () => {
		const current = await getContent();
		const draft = structuredClone(current);
		await change(draft);
		const changes = diff(current, draft);
		if (!changes.length) return current;

		draft.updatedAt = new Date().toISOString();
		const saved = await backup();
		await write(draft);
		cache = Promise.resolve(draft);
		try {
			await record({ by, changes, backup: saved, ...(restored && { restored }) });
		} catch (e) {
			// The content is saved; a log that can't be written shouldn't undo that
			console.error('Could not write the change log', e);
		}
		sweepUploads().catch((e) => console.error('Could not clean up uploads', e));
		return draft;
	});
	queue = run.catch(() => {});
	return run;
}

// ---------- backups ----------

// Every version from the last 30 days is kept, then the last one of each day
// for a year. The newest 40 are always kept, however old.
const KEEP_ALL_DAYS = 30;
const KEEP_DAILY_DAYS = 365;
const KEEP_MIN = 40;

const BACKUP_NAME = /^content-(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z\.json$/;

/** When a backup was taken, read from its name. */
export function backupTime(name: string) {
	const m = BACKUP_NAME.exec(name);
	return m ? new Date(`${m[1]}T${m[2]}:${m[3]}:${m[4]}.${m[5]}Z`) : undefined;
}

/** Copies the current version aside and returns the copy's name. */
async function backup() {
	try {
		await fs.mkdir(backups, { recursive: true });
		const name = `content-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
		await fs.copyFile(file, path.join(backups, name));
		await prune();
		return name;
	} catch (e) {
		if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
	}
}

async function prune() {
	const now = Date.now();
	const days = new Set<string>();
	const doomed = (await listBackups()).filter((b, i) => {
		const age = now - b.saved.getTime();
		if (i < KEEP_MIN || age < KEEP_ALL_DAYS * DAY) return false;
		if (age > KEEP_DAILY_DAYS * DAY) return true;
		// Newest first, so the first one seen for a day is the last one saved that day
		const day = b.saved.toISOString().slice(0, 10);
		if (days.has(day)) return true;
		days.add(day);
		return false;
	});
	await Promise.all(doomed.map((b) => fs.rm(path.join(backups, b.name), { force: true })));
}

/** Saved versions, newest first. */
export async function listBackups() {
	let names: string[];
	try {
		names = (await fs.readdir(backups)).filter((n) => BACKUP_NAME.test(n));
	} catch {
		return [];
	}
	return names
		.map((name) => ({ name, saved: backupTime(name)! }))
		.sort((a, b) => b.saved.getTime() - a.saved.getTime());
}

export async function restoreBackup(name: string) {
	const saved = backupTime(name);
	if (!saved) throw new Error('Invalid backup name');
	const restored = normalize(JSON.parse(await fs.readFile(path.join(backups, name), 'utf8')));
	return update(
		(draft) => {
			Object.assign(draft, restored);
		},
		{ restored: saved.toISOString() }
	);
}

// ---------- uploads ----------

export const IMAGE_TYPES = {
	jpg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp',
	avif: 'image/avif',
	svg: 'image/svg+xml'
} as const;
export type ImageExt = keyof typeof IMAGE_TYPES;

/** Works out the real image type from the file's first bytes, ignoring what the browser claims. */
function sniff(bytes: Uint8Array): ImageExt | undefined {
	const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
	if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
	if (ascii(1, 4) === 'PNG') return 'png';
	if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'webp';
	if (ascii(4, 8) === 'ftyp' && /avi[fs]/.test(ascii(8, 12))) return 'avif';
	const head = new TextDecoder().decode(bytes.subarray(0, 1024)).trimStart();
	if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(head)) return 'svg';
}

export class UploadError extends Error {}

export async function saveUpload(
	upload: File,
	{ maxMb = 8, allowSvg = false }: { maxMb?: number; allowSvg?: boolean } = {}
): Promise<string> {
	const m = msg().errors;
	if (upload.size > maxMb * 1024 * 1024) throw new UploadError(m.imageSize(maxMb));
	let bytes: Uint8Array = new Uint8Array(await upload.arrayBuffer());
	const ext = sniff(bytes);
	if (!ext || (ext === 'svg' && !allowSvg)) throw new UploadError(m.imageType(allowSvg));
	if (ext === 'jpg') bytes = stripLocation(bytes);
	await fs.mkdir(uploads, { recursive: true });
	const name = `${randomBytes(9).toString('base64url').toLowerCase().replace(/[^a-z0-9]/g, 'x')}.${ext}`;
	await fs.writeFile(path.join(uploads, name), bytes);
	return `/uploads/${name}`;
}

// Replaced images stay on disk while any kept version of the site still uses
// them, so restoring that version brings them back. Once no version does, they
// are deleted. Runs at most once a day, after a save.
let lastSweep = 0;

async function sweepUploads() {
	if (Date.now() - lastSweep < DAY) return;
	lastSweep = Date.now();

	const used = new Set<string>();
	const collect = (text: string) => {
		for (const m of text.matchAll(/\/uploads\/([a-z0-9]+\.[a-z]+)/g)) used.add(m[1]);
	};
	collect(await fs.readFile(file, 'utf8'));
	for (const b of await listBackups()) collect(await fs.readFile(path.join(backups, b.name), 'utf8'));

	let names: string[];
	try {
		names = await fs.readdir(uploads);
	} catch {
		return;
	}
	for (const name of names) {
		if (used.has(name)) continue;
		const at = path.join(uploads, name);
		// Leave anything recent alone: it may belong to a save that is still going through
		if (Date.now() - (await fs.stat(at)).mtimeMs > DAY) await fs.rm(at, { force: true });
	}
}

/** Runs once per data folder: removes the GPS position from photos uploaded before this was in place. */
export async function cleanOldUploads() {
	const marker = path.join(dataDir, '.uploads-cleaned');
	try {
		await fs.access(marker);
		return;
	} catch {}
	let names: string[] = [];
	try {
		names = await fs.readdir(uploads);
	} catch {}
	for (const name of names.filter((n) => n.endsWith('.jpg'))) {
		const at = path.join(uploads, name);
		const bytes = new Uint8Array(await fs.readFile(at));
		const clean = stripLocation(bytes);
		if (clean !== bytes) await writeAtomic(at, clean);
	}
	await writeAtomic(marker, new Date().toISOString());
}
