import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { DATA_DIR } from '$app/env/private';

/** Folder for content.json, accounts, the change log, backups and uploads. */
export const dataDir = path.resolve(DATA_DIR);

/** Replaces a file in one step, so it is never left half written. */
export async function writeAtomic(file: string, text: string | Uint8Array) {
	await fs.mkdir(path.dirname(file), { recursive: true });
	const tmp = `${file}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`;
	await fs.writeFile(tmp, text);
	await fs.rename(tmp, file);
}

/** Reads a JSON file, or returns undefined when it doesn't exist yet. */
export async function readJson<T>(file: string): Promise<T | undefined> {
	try {
		return JSON.parse(await fs.readFile(file, 'utf8')) as T;
	} catch (e) {
		if ((e as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
		throw e;
	}
}

export const newId = () => randomBytes(6).toString('hex');
