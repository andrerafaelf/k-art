import { fail, redirect, type Cookies } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Lang } from '#lib/content.ts';
import { getUsers, setSessionCookie, signIn, LANG_COOKIE, SESSION_DAYS } from '#lib/server/auth.ts';
import { msg } from '#lib/server/lang.ts';

/** Only ever send people on to a page inside the admin. */
const safeNext = (next: string | null) =>
	next && next.startsWith('/admin') && !next.startsWith('/admin/login') ? next : '/admin';

const rememberLang = (cookies: Cookies, lang: Lang) =>
	cookies.set(LANG_COOKIE, lang, { path: '/admin', httpOnly: true, sameSite: 'lax', maxAge: 365 * 86_400 });

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
	if (locals.user) redirect(303, safeNext(url.searchParams.get('next')));
	const asked = url.searchParams.get('lang');
	if (asked === 'pt' || asked === 'en') rememberLang(cookies, asked);
	return {
		locked: !(await getUsers()).length,
		signedOut: url.searchParams.has('out'),
		days: SESSION_DAYS
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, url, getClientAddress }) => {
		const data = await request.formData();
		const username = String(data.get('username') ?? '').slice(0, 100);
		const remember = data.get('remember') === 'on';
		const result = await signIn({
			username,
			password: String(data.get('password') ?? '').slice(0, 500),
			remember,
			address: getClientAddress(),
			agent: request.headers.get('user-agent') ?? ''
		});

		if (!result.ok) {
			const m = msg().login;
			const message =
				result.reason === 'blocked' ? m.blocked(result.minutes) : result.reason === 'locked' ? m.locked : m.invalid;
			return fail(result.reason === 'blocked' ? 429 : 400, { username, remember, error: message });
		}

		setSessionCookie(cookies, url, result.token, remember);
		rememberLang(cookies, result.user.lang);
		redirect(303, safeNext(url.searchParams.get('next')));
	}
};
