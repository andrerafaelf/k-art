import path from 'node:path';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { ADMIN_USER, ADMIN_PASSWORD } from '$app/env/private';
import type { Lang } from '#lib/content.ts';
import { dataDir, newId, readJson, writeAtomic } from './files.ts';
import { record } from './log.ts';

// Admin accounts and sessions. Passwords are stored as scrypt hashes in
// users.json. Signing in sets a random token in a cookie; sessions.json keeps
// only a hash of it, so a copy of the data folder can't be used to sign in.
// The first account comes from ADMIN_USER and ADMIN_PASSWORD, on first start.

export interface User {
	id: string;
	username: string;
	name: string;
	lang: Lang;
	hash: string;
	created: string;
}

/** What the rest of the app knows about the signed-in person */
export type SignedIn = Pick<User, 'id' | 'username' | 'name' | 'lang'>;

export interface Session {
	/** Hash of the token in the cookie */
	id: string;
	user: string;
	created: number;
	seen: number;
	/** When the cookie was last re-sent with a fresh expiry */
	renewed: number;
	remember: boolean;
	/** Browser and system, like "Safari, iPhone" */
	device: string;
}

const usersFile = path.join(dataDir, 'users.json');
const sessionsFile = path.join(dataDir, 'sessions.json');

const MINUTE = 60_000;
const DAY = 86_400_000;
/** "Keep me signed in": stays signed in while used at least once every this many days */
export const SESSION_DAYS = 30;
/** Otherwise the session ends when the browser closes, or after this long unused */
const SHORT = 12 * 60 * MINUTE;
/** Everyone signs in again at least this often */
const LONGEST = 180 * DAY;
export const MIN_PASSWORD = 10;

/** Over HTTPS the cookie gets the __Host- prefix, which browsers only accept from a secure page, for this exact site */
export const sessionCookie = (url: URL) => (url.protocol === 'https:' ? '__Host-kart_session' : 'kart_session');
/** Remembers the admin language for the sign-in page */
export const LANG_COOKIE = 'kart_lang';

const pub = ({ id, username, name, lang }: User): SignedIn => ({ id, username, name, lang });
export const normalizeUsername = (s: string) => s.trim().normalize('NFC').toLowerCase();

// ---------- passwords ----------

const COST = 2 ** 15;

function derive(password: string, salt: Buffer, cost = COST) {
	return new Promise<Buffer>((resolve, reject) =>
		scrypt(password.normalize('NFC'), salt, 32, { N: cost, r: 8, p: 1, maxmem: 256 * cost * 8 }, (e, key) =>
			e ? reject(e) : resolve(key)
		)
	);
}

export async function hashPassword(password: string) {
	const salt = randomBytes(16);
	const key = await derive(password, salt);
	return `scrypt$${COST}$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

async function verify(password: string, stored: string) {
	const [scheme, cost, salt, key] = stored.split('$');
	if (scheme !== 'scrypt' || !salt || !key) return false;
	const want = Buffer.from(key, 'base64url');
	const got = await derive(password, Buffer.from(salt, 'base64url'), Number(cost));
	return got.length === want.length && timingSafeEqual(got, want);
}

// Checked against when the username doesn't exist, so a wrong name takes as
// long as a wrong password and the response time gives nothing away
let decoy: Promise<string> | undefined;

// ---------- accounts ----------

let users: Promise<User[]> | undefined;
let usersQueue: Promise<unknown> = Promise.resolve();

async function loadUsers(): Promise<User[]> {
	const list = (await readJson<{ users: User[] }>(usersFile))?.users ?? [];
	if (list.length || !ADMIN_USER || !ADMIN_PASSWORD) return list;

	const first: User = {
		id: newId(),
		username: normalizeUsername(ADMIN_USER),
		name: ADMIN_USER.trim(),
		lang: 'pt',
		hash: await hashPassword(ADMIN_PASSWORD),
		created: new Date().toISOString()
	};
	await writeAtomic(usersFile, JSON.stringify({ users: [first] }, null, '\t'));
	await record({ account: { event: 'first-account', name: first.name } });
	return [first];
}

export function getUsers(): Promise<User[]> {
	users ??= loadUsers().catch((e) => {
		users = undefined;
		throw e;
	});
	return users;
}

/** Changes the accounts one at a time, on a copy, and saves them. */
function changeUsers<T>(fn: (list: User[]) => T | Promise<T>): Promise<T> {
	const run = usersQueue.then(async () => {
		const list = structuredClone(await getUsers());
		const result = await fn(list);
		await writeAtomic(usersFile, JSON.stringify({ users: list }, null, '\t'));
		users = Promise.resolve(list);
		return result;
	});
	usersQueue = run.catch(() => {});
	return run;
}

export async function findUser(id: string) {
	return (await getUsers()).find((u) => u.id === id);
}

export async function usernameTaken(username: string, except?: string) {
	const name = normalizeUsername(username);
	return (await getUsers()).some((u) => u.username === name && u.id !== except);
}

export async function checkPassword(userId: string, password: string) {
	const user = await findUser(userId);
	return !!user && verify(password, user.hash);
}

export async function addUser(fields: { name: string; username: string; password: string }) {
	const user: User = {
		id: newId(),
		name: fields.name,
		username: normalizeUsername(fields.username),
		lang: 'pt',
		hash: await hashPassword(fields.password),
		created: new Date().toISOString()
	};
	await changeUsers((list) => void list.push(user));
	await record({ account: { event: 'user-add', name: user.name } });
}

export async function updateProfile(id: string, fields: { name: string; username: string; lang: Lang }) {
	await changeUsers((list) => {
		const user = list.find((u) => u.id === id);
		if (user) Object.assign(user, { ...fields, username: normalizeUsername(fields.username) });
	});
	await record({ account: { event: 'profile' } });
}

/** Sets a new password and signs that person out everywhere, except in the session given. */
export async function setPassword(id: string, password: string, keepSession?: string) {
	const hash = await hashPassword(password);
	const user = await changeUsers((list) => {
		const user = list.find((u) => u.id === id);
		if (user) user.hash = hash;
		return user;
	});
	await endSessions((s) => s.user === id && s.id !== keepSession);
	const self = !!keepSession;
	await record({ account: self ? { event: 'password' } : { event: 'user-password', name: user?.name } });
}

export async function removeUser(id: string) {
	const user = await changeUsers((list) => {
		const i = list.findIndex((u) => u.id === id);
		return i >= 0 ? list.splice(i, 1)[0] : undefined;
	});
	await endSessions((s) => s.user === id);
	if (user) await record({ account: { event: 'user-remove', name: user.name } });
}

/** Everyone with access, with when they were last active. */
export async function people() {
	const all = [...(await getSessions()).values()];
	return (await getUsers()).map((u) => {
		const seen = Math.max(0, ...all.filter((s) => s.user === u.id).map((s) => s.seen));
		return { ...pub(u), seen: seen ? new Date(seen).toISOString() : undefined };
	});
}

// ---------- sessions ----------

let sessions: Promise<Map<string, Session>> | undefined;
let sessionsQueue: Promise<unknown> = Promise.resolve();
let saveTimer: ReturnType<typeof setTimeout> | undefined;

const expired = (s: Session, now: number) =>
	now - s.seen > (s.remember ? SESSION_DAYS * DAY : SHORT) || now - s.created > LONGEST;

async function loadSessions() {
	const list = (await readJson<{ sessions: Session[] }>(sessionsFile))?.sessions ?? [];
	const now = Date.now();
	return new Map(list.filter((s) => !expired(s, now)).map((s) => [s.id, s]));
}

function getSessions() {
	sessions ??= loadSessions().catch((e) => {
		sessions = undefined;
		throw e;
	});
	return sessions;
}

function saveSessions(): Promise<void> {
	clearTimeout(saveTimer);
	const run = sessionsQueue.then(async () => {
		const map = await getSessions();
		await writeAtomic(sessionsFile, JSON.stringify({ sessions: [...map.values()] }, null, '\t'));
	});
	sessionsQueue = run.catch(() => {});
	return run;
}

/** For "last active" times, which can wait a little */
function saveSessionsSoon() {
	clearTimeout(saveTimer);
	saveTimer = setTimeout(() => saveSessions().catch((e) => console.error('Could not save sessions', e)), 30_000);
	saveTimer.unref?.();
}

const tokenHash = (token: string) => createHash('sha256').update(token).digest('base64url');

/** "Safari, iPhone" from a user agent string. Empty when it can't tell. */
function device(agent: string) {
	const browser = /Edg(e|iOS|A)?\//.test(agent)
		? 'Edge'
		: /OPR\//.test(agent)
			? 'Opera'
			: /Firefox\/|FxiOS/.test(agent)
				? 'Firefox'
				: /Chrome\/|CriOS/.test(agent)
					? 'Chrome'
					: /Safari\//.test(agent)
						? 'Safari'
						: '';
	const system = /iPhone/.test(agent)
		? 'iPhone'
		: /iPad/.test(agent)
			? 'iPad'
			: /Android/.test(agent)
				? 'Android'
				: /Windows/.test(agent)
					? 'Windows'
					: /Macintosh|Mac OS X/.test(agent)
						? 'Mac'
						: /Linux/.test(agent)
							? 'Linux'
							: '';
	return [browser, system].filter(Boolean).join(', ');
}

export function setSessionCookie(cookies: Cookies, url: URL, token: string, remember: boolean) {
	cookies.set(sessionCookie(url), token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		...(remember && { maxAge: (SESSION_DAYS * DAY) / 1000 })
	});
}

/** The person a session token belongs to, or nothing when it is unknown or has run out. */
export async function authenticate(token: string) {
	if (!token || token.length > 100) return;
	const map = await getSessions();
	const session = map.get(tokenHash(token));
	if (!session) return;

	const now = Date.now();
	const user = await findUser(session.user);
	if (!user || expired(session, now)) {
		map.delete(session.id);
		saveSessionsSoon();
		return;
	}

	if (now - session.seen > 5 * MINUTE) {
		session.seen = now;
		saveSessionsSoon();
	}
	// A remembered session's cookie gets a fresh 30 days once a day while in use
	const renew = session.remember && now - session.renewed > DAY;
	if (renew) session.renewed = now;
	return { user: pub(user), session, renew };
}

export async function sessionsOf(userId: string) {
	return [...(await getSessions()).values()]
		.filter((s) => s.user === userId)
		.sort((a, b) => b.seen - a.seen)
		.map((s) => ({ id: s.id, device: s.device, seen: new Date(s.seen).toISOString(), created: new Date(s.created).toISOString() }));
}

export async function endSessions(which: (s: Session) => boolean) {
	const map = await getSessions();
	let ended = 0;
	for (const s of [...map.values()]) {
		if (!which(s)) continue;
		map.delete(s.id);
		ended++;
	}
	if (ended) await saveSessions();
	return ended;
}

export async function signOut(sessionId: string) {
	await endSessions((s) => s.id === sessionId);
	await record({ account: { event: 'signout' } });
}

// ---------- signing in ----------

// Ten wrong passwords from one address, or thirty for one username from
// anywhere, block further tries for 15 minutes
const WINDOW = 15 * MINUTE;
const MAX_PER_ADDRESS = 10;
const MAX_PER_USERNAME = 30;
const attempts = new Map<string, { count: number; first: number }>();

function waitFor(key: string, max: number) {
	const a = attempts.get(key);
	if (!a) return 0;
	const left = a.first + WINDOW - Date.now();
	if (left <= 0) {
		attempts.delete(key);
		return 0;
	}
	return a.count >= max ? left : 0;
}

function miss(key: string) {
	const a = attempts.get(key);
	const next = a && Date.now() - a.first < WINDOW ? { count: a.count + 1, first: a.first } : { count: 1, first: Date.now() };
	attempts.set(key, next);
	// Keep the table small if someone sprays requests from many addresses
	if (attempts.size > 5000) {
		for (const [k, v] of attempts) if (Date.now() - v.first > WINDOW) attempts.delete(k);
	}
	return next.count;
}

export type SignInResult =
	| { ok: true; token: string; user: SignedIn }
	| { ok: false; reason: 'invalid' | 'locked' }
	| { ok: false; reason: 'blocked'; minutes: number };

export async function signIn(input: {
	username: string;
	password: string;
	remember: boolean;
	address: string;
	agent: string;
}): Promise<SignInResult> {
	const list = await getUsers();
	if (!list.length) return { ok: false, reason: 'locked' };

	const username = normalizeUsername(input.username);
	const wait = Math.max(waitFor(`a:${input.address}`, MAX_PER_ADDRESS), waitFor(`u:${username}`, MAX_PER_USERNAME));
	if (wait) return { ok: false, reason: 'blocked', minutes: Math.ceil(wait / MINUTE) };

	const user = list.find((u) => u.username === username);
	decoy ??= hashPassword(randomBytes(16).toString('hex'));
	const ok = await verify(input.password, user?.hash ?? (await decoy));
	if (!user || !ok) {
		const count = miss(`a:${input.address}`);
		miss(`u:${username}`);
		if (count === MAX_PER_ADDRESS) await record({ account: { event: 'lockout', detail: input.address } });
		return { ok: false, reason: 'invalid' };
	}
	attempts.delete(`a:${input.address}`);
	attempts.delete(`u:${username}`);

	const token = randomBytes(32).toString('base64url');
	const now = Date.now();
	const session: Session = {
		id: tokenHash(token),
		user: user.id,
		created: now,
		seen: now,
		renewed: now,
		remember: input.remember,
		device: device(input.agent)
	};
	(await getSessions()).set(session.id, session);
	await saveSessions();
	await record({ by: { id: user.id, name: user.name }, account: { event: 'signin', detail: session.device } });
	return { ok: true, token, user: pub(user) };
}
