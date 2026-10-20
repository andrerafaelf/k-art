import { building, dev } from '$app/env';
import { CONTACT_FROM, CONTACT_TO, RESEND_API_KEY, TURNSTILE_SECRET_KEY } from '$app/env/private';
import { TURNSTILE_TEST_SECRET } from '#lib/contact.ts';

// What the contact form and the shop share to send email to the team: the
// Cloudflare Turnstile check, a limit on how often one address can send, and
// Resend (the same account as Vexara and the portfolio). CONTACT_TO is geral@,
// which Cloudflare Email Routing forwards to the team.
//
// Without RESEND_API_KEY the dev server prints the email instead of sending it.

const turnstileSecret = TURNSTILE_SECRET_KEY ?? (dev ? TURNSTILE_TEST_SECRET : undefined);

if (!dev && !building) {
	if (!RESEND_API_KEY) console.error('[mail] RESEND_API_KEY is not set, the contact form and shop cannot send');
	if (!TURNSTILE_SECRET_KEY) console.error('[mail] TURNSTILE_SECRET_KEY is not set, the contact form and shop cannot send');
}

// ---------- rate limit ----------

// Per address, and overall to protect the Resend quota the other sites share.
// Kept in memory, so a restart clears it.
const HOUR = 60 * 60 * 1000;
const RATES = [
	{ key: (address: string) => address, max: 5, window: HOUR },
	{ key: () => '*hour', max: 20, window: HOUR },
	{ key: () => '*day', max: 60, window: 24 * HOUR }
];
const sentAt = new Map<string, number[]>();

/** Counts a message from this address, or says it has sent too many. */
export function limited(address: string) {
	const now = Date.now();
	const keys = RATES.map((l) => {
		const key = l.key(address);
		const recent = (sentAt.get(key) ?? []).filter((t) => now - t < l.window);
		sentAt.set(key, recent);
		return { key, full: recent.length >= l.max };
	});
	if (keys.some((k) => k.full)) return true;
	for (const { key } of keys) sentAt.get(key)!.push(now);
	return false;
}

setInterval(() => {
	const now = Date.now();
	for (const [key, times] of sentAt) {
		if (times.every((t) => now - t >= 24 * HOUR)) sentAt.delete(key);
	}
}, HOUR).unref();

// ---------- checks ----------

export const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

/** Asks Cloudflare whether the token the Turnstile widget gave the browser is genuine. */
export async function human(token: string, address: string) {
	if (!token || !turnstileSecret) return false;
	try {
		const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ secret: turnstileSecret, response: token, remoteip: address }),
			signal: AbortSignal.timeout(8_000)
		});
		const result = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
		if (!result.success) console.warn('[mail] turnstile rejected:', result['error-codes']?.join(','));
		return result.success === true;
	} catch (e) {
		console.error('[mail] turnstile check failed:', (e as Error).message);
		return false;
	}
}

// ---------- sending ----------

export const escape = (value: string) =>
	value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** The team's email layout: a black bar with a lime rule, then the content on white. */
export const layout = (kicker: string, body: string) => `<div style="margin:0;padding:24px 12px;background:#efeee9">
<div style="max-width:600px;margin:0 auto;background:#ffffff;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#0b0b0c">
<div style="padding:16px 24px;background:#0a0a0b;border-bottom:4px solid #d6f906;color:#f3f3ef;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">K'ART Racing Team <span style="color:#d6f906">· ${escape(kicker)}</span></div>
<div style="padding:24px">
${body}
</div>
</div>
</div>`;

interface Email {
	/** Name shown as the sender in the team's inbox */
	from: string;
	replyTo: string;
	subject: string;
	text: string;
	html: string;
}

/** Sends an email to the team and returns its Resend id ('dev' when only printed). */
export async function sendToTeam({ from, replyTo, subject, text, html }: Email) {
	if (!RESEND_API_KEY) {
		if (!dev) throw new Error('RESEND_API_KEY is not set');
		console.log(`[mail] dev, not sending. To ${CONTACT_TO}: ${subject}\n${text}`);
		return 'dev';
	}
	// The sender's name shows in the inbox; quotes and brackets would break the header
	const display = `${from.replace(/["\\<>]/g, '')} · site K'ART`;
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: { authorization: `Bearer ${RESEND_API_KEY}`, 'content-type': 'application/json' },
		body: JSON.stringify({
			from: `"${display}" <${CONTACT_FROM}>`,
			to: [CONTACT_TO],
			reply_to: replyTo,
			subject,
			text,
			html
		}),
		signal: AbortSignal.timeout(10_000)
	});
	if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
	return ((await res.json()) as { id: string }).id;
}
