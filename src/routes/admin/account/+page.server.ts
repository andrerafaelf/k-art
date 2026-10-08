import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ADMIN_MESSAGES } from '#lib/admin/i18n.ts';
import {
	addUser,
	checkPassword,
	endSessions,
	normalizeUsername,
	people,
	removeUser,
	sessionsOf,
	setPassword,
	updateProfile,
	usernameTaken,
	LANG_COOKIE,
	MIN_PASSWORD
} from '#lib/server/auth.ts';
import { FormReader } from '#lib/server/form.ts';
import { msg } from '#lib/server/lang.ts';
import { record } from '#lib/server/log.ts';

export const load: PageServerLoad = async ({ locals }) => {
	const me = locals.user!;
	return {
		me,
		sessions: (await sessionsOf(me.id)).map((s) => ({ ...s, current: s.id === locals.session })),
		people: await people(),
		minPassword: MIN_PASSWORD
	};
};

/** Checks a new password, filing problems under the given field names. */
function checkNew(f: FormReader, password: string, username: string, field: string, repeat?: { value: string; field: string }) {
	const m = msg().account;
	if (password.length < MIN_PASSWORD) f.error(field, m.short(MIN_PASSWORD));
	else if (normalizeUsername(password) === normalizeUsername(username)) f.error(field, m.sameAsUsername);
	else if (repeat && repeat.value !== password) f.error(repeat.field, m.mismatch);
}

/** Display name and username, shared by "your details" and "give someone access". */
async function readIdentity(f: FormReader, prefix: string, except?: string) {
	const m = msg().account;
	const name = f.text(`${prefix}name`, { required: true, max: 40 });
	const username = f.text(`${prefix}username`, { required: true, max: 40 });
	if (username && /\s/.test(username)) f.error(`${prefix}username`, m.usernameSpaces);
	else if (username && (await usernameTaken(username, except))) f.error(`${prefix}username`, m.usernameTaken);
	return { name, username };
}

// Passwords are read as typed: spaces at either end count
const secret = (data: FormData, name: string) => String(data.get(name) ?? '').slice(0, 500);

export const actions: Actions = {
	profile: async ({ request, locals, cookies }) => {
		const f = new FormReader(await request.formData());
		const me = locals.user!;
		const { name, username } = await readIdentity(f, '', me.id);
		const lang = f.choice('lang', ['pt', 'en'] as const, 'pt');
		if (!f.ok) return f.fail();

		await updateProfile(me.id, { name, username, lang });
		cookies.set(LANG_COOKIE, lang, { path: '/admin', httpOnly: true, sameSite: 'lax', maxAge: 365 * 86_400 });
		// Answered in the language just picked
		return { message: ADMIN_MESSAGES[lang].account.detailsSaved };
	},

	password: async ({ request, locals }) => {
		const data = await request.formData();
		const f = new FormReader(data);
		const me = locals.user!;
		const m = msg().account;
		const current = secret(data, 'current');
		const next = secret(data, 'next');
		if (!(await checkPassword(me.id, current))) f.error('current', m.wrongPassword);
		checkNew(f, next, me.username, 'next', { value: secret(data, 'repeat'), field: 'repeat' });
		if (!f.ok) return f.fail();

		await setPassword(me.id, next, locals.session);
		return { message: m.passwordSaved };
	},

	endSession: async ({ request, locals }) => {
		const id = String((await request.formData()).get('id'));
		const me = locals.user!;
		await endSessions((s) => s.id === id && s.user === me.id && s.id !== locals.session);
		return { message: msg().account.ended };
	},

	endOthers: async ({ locals }) => {
		const me = locals.user!;
		const ended = await endSessions((s) => s.user === me.id && s.id !== locals.session);
		if (ended) await record({ account: { event: 'sessions' } });
		return { message: msg().account.endedOthers };
	},

	addUser: async ({ request }) => {
		const data = await request.formData();
		const f = new FormReader(data);
		const { name, username } = await readIdentity(f, 'add_');
		const password = secret(data, 'add_password');
		checkNew(f, password, username, 'add_password');
		if (!f.ok) return f.fail();

		await addUser({ name, username, password });
		return { message: msg().account.added(name), added: true };
	},

	userPassword: async ({ request, locals }) => {
		const data = await request.formData();
		const f = new FormReader(data);
		const id = String(data.get('id'));
		const person = (await people()).find((p) => p.id === id);
		if (!person || id === locals.user!.id) error(404, 'Not found');
		const field = `pw_${id}`;
		const password = secret(data, 'password');
		checkNew(f, password, person.username, field);
		if (!f.ok) return f.fail();

		await setPassword(id, password);
		return { message: msg().account.userPasswordSaved(person.name) };
	},

	removeUser: async ({ request, locals }) => {
		const id = String((await request.formData()).get('id'));
		const m = msg().account;
		if (id === locals.user!.id) return fail(400, { message: m.self });
		const person = (await people()).find((p) => p.id === id);
		if (!person) error(404, 'Not found');
		await removeUser(id);
		return { message: m.removed(person.name) };
	}
};
