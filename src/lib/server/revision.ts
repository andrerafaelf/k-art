import { createHash } from 'node:crypto';

/** A short fingerprint of an item, sent with edit forms to notice when it changed in the meantime. */
export const revision = (value: unknown) =>
	createHash('sha256').update(JSON.stringify(value)).digest('base64url').slice(0, 16);
