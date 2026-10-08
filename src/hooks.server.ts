import type { Handle } from '@sveltejs/kit/hooks';
import { createHash, timingSafeEqual } from 'node:crypto';
import { ADMIN_USER, ADMIN_PASSWORD } from '$app/env/private';
import { gate } from '#lib/server/gate.ts';

// /admin is protected with HTTP Basic Auth. Credentials come from the
// ADMIN_USER and ADMIN_PASSWORD environment variables; the site must be served
// over HTTPS in production so they are never sent in the clear.

const MAX_FAILURES = 10;
const LOCKOUT_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; first: number }>();

const digest = (s: string) => createHash('sha256').update(s).digest();
const same = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

/** Returns the username when the Authorization header carries the right credentials. */
function authorised(header: string | null) {
	if (!header?.startsWith('Basic ')) return undefined;
	const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
	const split = decoded.indexOf(':');
	if (split < 0) return undefined;
	const name = decoded.slice(0, split);
	// Check both halves every time so the response time gives nothing away
	const user = same(name, ADMIN_USER!);
	const pass = same(decoded.slice(split + 1), ADMIN_PASSWORD!);
	return user && pass ? name : undefined;
}

const plain = (status: number, body: string, headers: Record<string, string> = {}) =>
	new Response(body, { status, headers: { 'content-type': 'text/plain; charset=utf-8', ...headers } });

const guard: Handle = async ({ event, resolve }) => {
	if (!ADMIN_USER || !ADMIN_PASSWORD) {
		return plain(503, 'The admin is locked. Set ADMIN_USER and ADMIN_PASSWORD to enable it.');
	}

	const ip = event.getClientAddress();
	const record = failures.get(ip);
	if (record && Date.now() - record.first > LOCKOUT_MS) failures.delete(ip);
	if (record && record.count >= MAX_FAILURES && Date.now() - record.first <= LOCKOUT_MS) {
		return plain(429, 'Too many failed sign-in attempts. Try again in 15 minutes.', {
			'retry-after': String(Math.ceil((record.first + LOCKOUT_MS - Date.now()) / 1000))
		});
	}

	const header = event.request.headers.get('authorization');
	const admin = authorised(header);
	if (!admin) {
		if (header) {
			const r = failures.get(ip) ?? { count: 0, first: Date.now() };
			r.count += 1;
			failures.set(ip, r);
			// Keep the table small if someone sprays requests from many addresses
			if (failures.size > 5000) failures.clear();
		}
		return plain(401, 'Sign in to manage the K\'ART website.', {
			'www-authenticate': 'Basic realm="K\'ART admin", charset="UTF-8"'
		});
	}
	failures.delete(ip);
	event.locals.admin = admin;

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', 'en')
	});
	response.headers.set('cache-control', 'no-store');
	response.headers.set('x-robots-tag', 'noindex, nofollow');
	response.headers.set('x-frame-options', 'DENY');
	return response;
};

export const handle: Handle = async ({ event, resolve }) => {
	const blocked = gate(event);
	if (blocked) return blocked;

	const { pathname } = event.url;
	if (pathname === '/admin' || pathname.startsWith('/admin/')) return guard({ event, resolve });

	const lang = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'pt-PT';
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
