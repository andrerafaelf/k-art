import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { DATA_DIR } from '$app/env/private';
import type { Content } from '#lib/content.ts';
import { seed } from './seed.ts';

// All site content lives in one JSON file. Every save is written atomically
// and the previous version is kept in backups/, so any edit can be undone.

const root = path.resolve(DATA_DIR);
const file = path.join(root, 'content.json');
const backups = path.join(root, 'backups');
export const uploads = path.join(root, 'uploads');

const KEEP_BACKUPS = 40;

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

async function write(content: Content) {
	await fs.mkdir(root, { recursive: true });
	const tmp = `${file}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`;
	await fs.writeFile(tmp, JSON.stringify(content, null, '\t'));
	await fs.rename(tmp, file);
}

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
 * copy, so a failed edit never leaves half-written data behind.
 */
export function update(change: (draft: Content) => void | Promise<void>): Promise<Content> {
	const run = queue.then(async () => {
		const current = await getContent();
		const draft = structuredClone(current);
		await change(draft);
		draft.updatedAt = new Date().toISOString();
		await backup();
		await write(draft);
		cache = Promise.resolve(draft);
		return draft;
	});
	queue = run.catch(() => {});
	return run;
}

// ---------- backups ----------

async function backup() {
	try {
		await fs.mkdir(backups, { recursive: true });
		const stamp = new Date().toISOString().replace(/[:.]/g, '-');
		await fs.copyFile(file, path.join(backups, `content-${stamp}.json`));
		const old = (await listBackups()).slice(KEEP_BACKUPS);
		await Promise.all(old.map((b) => fs.rm(path.join(backups, b.name), { force: true })));
	} catch (e) {
		if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
	}
}

export async function listBackups() {
	try {
		const names = (await fs.readdir(backups)).filter((n) => /^content-[\w-]+\.json$/.test(n));
		const stats = await Promise.all(
			names.map(async (name) => ({ name, saved: (await fs.stat(path.join(backups, name))).mtime }))
		);
		return stats.sort((a, b) => b.saved.getTime() - a.saved.getTime());
	} catch {
		return [];
	}
}

export async function restoreBackup(name: string) {
	if (!/^content-[\w-]+\.json$/.test(name)) throw new Error('Invalid backup name');
	const restored = normalize(JSON.parse(await fs.readFile(path.join(backups, name), 'utf8')));
	return update((draft) => {
		Object.assign(draft, restored);
	});
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
	if (upload.size > maxMb * 1024 * 1024) throw new UploadError(`Images must be under ${maxMb} MB.`);
	const bytes = new Uint8Array(await upload.arrayBuffer());
	const ext = sniff(bytes);
	if (!ext || (ext === 'svg' && !allowSvg)) {
		throw new UploadError(allowSvg ? 'Use a JPG, PNG, WebP, AVIF or SVG image.' : 'Use a JPG, PNG, WebP or AVIF image.');
	}
	await fs.mkdir(uploads, { recursive: true });
	const name = `${randomBytes(9).toString('base64url').toLowerCase().replace(/[^a-z0-9]/g, 'x')}.${ext}`;
	await fs.writeFile(path.join(uploads, name), bytes);
	return `/uploads/${name}`;
}

export const newId = () => randomBytes(6).toString('hex');
