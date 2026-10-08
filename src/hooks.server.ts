import { redirect } from '@sveltejs/kit';
import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { authenticate, setSessionCookie, sessionCookie, LANG_COOKIE } from '#lib/server/auth.ts';
import { cleanOldUploads } from '#lib/server/store.ts';
import { gate } from '#lib/server/gate.ts';

// /admin needs a signed-in account (see lib/server/auth.ts). The session
// cookie is read on every request, so signed-in people can also preview
// drafts on the public site.

export const init: ServerInit = async () => {
	await cleanOldUploads();
};

const isAdmin = (pathname: string) => pathname === '/admin' || pathname.startsWith('/admin/');

export const handle: Handle = async ({ event, resolve }) => {
	const blocked = gate(event);
	if (blocked) return blocked;

	const { pathname } = event.url;

	const token = event.cookies.get(sessionCookie(event.url));
	if (token) {
		const found = await authenticate(token);
		if (found) {
			event.locals.user = found.user;
			event.locals.session = found.session.id;
			if (found.renew) setSessionCookie(event.cookies, event.url, token, true);
		} else {
			event.cookies.delete(sessionCookie(event.url), { path: '/' });
		}
	}

	if (!isAdmin(pathname)) {
		const lang = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'pt-PT';
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%lang%', lang)
		});
	}

	// The admin speaks the signed-in person's language. Before signing in it
	// uses the one last picked on this device, Portuguese by default.
	const asked = event.url.searchParams.get('lang');
	event.locals.lang =
		event.locals.user?.lang ?? (asked === 'en' || (!asked && event.cookies.get(LANG_COOKIE) === 'en') ? 'en' : 'pt');

	if (!event.locals.user && pathname !== '/admin/login') {
		// Come back to the same page after signing in (a form post comes back to its page)
		const back = event.request.method === 'GET' ? pathname + event.url.search : pathname;
		redirect(303, back === '/admin' ? '/admin/login' : `/admin/login?next=${encodeURIComponent(back)}`);
	}

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', event.locals.lang === 'en' ? 'en' : 'pt-PT')
	});
	response.headers.set('cache-control', 'no-store');
	response.headers.set('x-robots-tag', 'noindex, nofollow');
	response.headers.set('x-frame-options', 'DENY');
	response.headers.set('referrer-policy', 'same-origin');
	return response;
};
