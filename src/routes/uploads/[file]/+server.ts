import fs from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { uploads, IMAGE_TYPES, type ImageExt } from '#lib/server/store.ts';

// Serves images uploaded through the admin. File names are random and never
// reused, so they can be cached forever.

export const GET: RequestHandler = async ({ params }) => {
	const match = params.file.match(/^[a-z0-9]+\.([a-z]+)$/);
	const ext = match?.[1] as ImageExt | undefined;
	if (!ext || !(ext in IMAGE_TYPES)) error(404, 'Not found');

	let body: Buffer;
	try {
		body = await fs.readFile(path.join(uploads, params.file));
	} catch {
		error(404, 'Not found');
	}

	return new Response(new Uint8Array(body), {
		headers: {
			'content-type': IMAGE_TYPES[ext],
			'cache-control': 'public, max-age=31536000, immutable',
			'x-content-type-options': 'nosniff',
			// An SVG opened directly can't run scripts or load anything
			'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox"
		}
	});
};
