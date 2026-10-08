import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { signOut, sessionCookie } from '#lib/server/auth.ts';

export const POST: RequestHandler = async ({ locals, cookies, url }) => {
	if (locals.session) await signOut(locals.session);
	cookies.delete(sessionCookie(url), { path: '/' });
	redirect(303, '/admin/login?out');
};
