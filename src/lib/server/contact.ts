import { fail, type RequestEvent } from '@sveltejs/kit';
import { building, dev } from '$app/env';
import { CONTACT_FROM, CONTACT_TO, RESEND_API_KEY, TURNSTILE_SECRET_KEY } from '$app/env/private';
import {
	HONEYPOT,
	LIMITS,
	TOPICS,
	TURNSTILE_TEST_SECRET,
	type ContactFailed,
	type ContactSent,
	type ContactValues,
	type Topic
} from '#lib/contact.ts';

// The contact form on the home page. It checks the fields and the Cloudflare
// Turnstile token, limits how often one address can send, and passes the
// message to the team inbox through Resend (the same account as Vexara and the
// portfolio), with reply-to set to the sender. CONTACT_TO is geral@, which
// Cloudflare Email Routing forwards to the team.
//
// Without RESEND_API_KEY the dev server prints the email instead of sending it.

const turnstileSecret = TURNSTILE_SECRET_KEY ?? (dev ? TURNSTILE_TEST_SECRET : undefined);

if (!dev && !building) {
	if (!RESEND_API_KEY) console.error('[contact] RESEND_API_KEY is not set, the contact form cannot send');
	if (!TURNSTILE_SECRET_KEY) console.error('[contact] TURNSTILE_SECRET_KEY is not set, the contact form cannot send');
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

function limited(address: string) {
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

const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function read(data: FormData): ContactValues {
	const text = (name: string) => String(data.get(name) ?? '').trim();
	const topic = text('topic') as Topic;
	return {
		name: text('name').replace(/\s+/g, ' ').slice(0, LIMITS.name),
		email: text('email').slice(0, LIMITS.email),
		topic: TOPICS.includes(topic) ? topic : '',
		message: text('message').replace(/\r\n/g, '\n')
	};
}

function check(values: ContactValues) {
	const errors: ContactFailed['errors'] = {};
	if (!values.name) errors.name = 'name';
	if (!EMAIL.test(values.email)) errors.email = 'email';
	if (values.message.length < LIMITS.minMessage) errors.message = 'short';
	else if (values.message.length > LIMITS.message) errors.message = 'long';
	return errors;
}

/** Asks Cloudflare whether the token the Turnstile widget gave the browser is genuine. */
async function human(token: string, address: string) {
	if (!token || !turnstileSecret) return false;
	try {
		const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ secret: turnstileSecret, response: token, remoteip: address }),
			signal: AbortSignal.timeout(8_000)
		});
		const result = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
		if (!result.success) console.warn('[contact] turnstile rejected:', result['error-codes']?.join(','));
		return result.success === true;
	} catch (e) {
		console.error('[contact] turnstile check failed:', (e as Error).message);
		return false;
	}
}

// ---------- the email ----------

// The team reads these in Portuguese, whichever language the visitor wrote in
const SUBJECTS: Record<Topic | '', string> = {
	drivers: 'Pilotos',
	partners: 'Parcerias',
	press: 'Imprensa',
	other: 'Outro assunto',
	'': 'Contacto'
};

const escape = (value: string) =>
	value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function compose({ name, email, topic, message }: ContactValues, english: boolean) {
	const subject = `${SUBJECTS[topic]} · ${name}`;
	const note = english ? 'Escrito na versão inglesa do site, talvez prefira resposta em inglês.' : '';

	const text = [
		`${name} <${email}>`,
		`Assunto: ${SUBJECTS[topic]}`,
		...(note ? [note] : []),
		'',
		message,
		'',
		`Enviado pelo formulário de contacto em k-artracing.com. Responda a este email para responder diretamente a ${name}.`
	].join('\n');

	const n = escape(name);
	const e = escape(email);
	const html = `<div style="margin:0;padding:24px 12px;background:#efeee9">
<div style="max-width:600px;margin:0 auto;background:#ffffff;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#0b0b0c">
<div style="padding:16px 24px;background:#0a0a0b;border-bottom:4px solid #d6f906;color:#f3f3ef;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">K'ART Racing Team <span style="color:#d6f906">· ${escape(SUBJECTS[topic])}</span></div>
<div style="padding:24px">
<p style="margin:0;font-size:18px;font-weight:700">${n}</p>
<p style="margin:2px 0 0"><a href="mailto:${e}" style="color:#0478fb">${e}</a></p>
${note ? `<p style="margin:10px 0 0;font-size:13px;color:#57534e">${note}</p>` : ''}
<div style="margin:20px 0;padding:16px 18px;background:#f4f4ef;border-left:3px solid #0a0a0b">${escape(message).replace(/\n/g, '<br>')}</div>
<p style="margin:0;font-size:13px;color:#57534e">Enviado pelo formulário de contacto em k-artracing.com. Responda a este email para responder diretamente a ${n}.</p>
</div>
</div>
</div>`;

	return { subject, text, html };
}

async function send(values: ContactValues, english: boolean) {
	const { subject, text, html } = compose(values, english);
	if (!RESEND_API_KEY) {
		if (!dev) throw new Error('RESEND_API_KEY is not set');
		console.log(`[contact] dev, not sending. To ${CONTACT_TO}: ${subject}\n${text}`);
		return 'dev';
	}
	// The sender's name shows in the inbox; quotes and brackets would break the header
	const display = `${values.name.replace(/["\\<>]/g, '')} · site K'ART`;
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: { authorization: `Bearer ${RESEND_API_KEY}`, 'content-type': 'application/json' },
		body: JSON.stringify({
			from: `"${display}" <${CONTACT_FROM}>`,
			to: [CONTACT_TO],
			reply_to: values.email,
			subject,
			text,
			html
		}),
		signal: AbortSignal.timeout(10_000)
	});
	if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
	return ((await res.json()) as { id: string }).id;
}

// ---------- the action ----------

const sent = (values: ContactValues): { contact: ContactSent } => ({
	contact: { sent: true, name: values.name, email: values.email }
});

/** The `contact` form action. */
export async function contact({ request, params, getClientAddress }: RequestEvent) {
	const data = await request.formData();
	const values = read(data);

	// Bots fill in every field, including the hidden one. Let them think it worked.
	if (String(data.get(HONEYPOT) ?? '')) return sent(values);

	const errors = check(values);
	if (Object.keys(errors).length) return fail(400, { contact: { values, errors } satisfies ContactFailed });

	const failed = (status: number, error: ContactFailed['error']) =>
		fail(status, { contact: { values, errors, error } satisfies ContactFailed });

	const address = getClientAddress();
	if (!(await human(String(data.get('cf-turnstile-response') ?? ''), address))) return failed(403, 'bot');
	if (limited(address)) return failed(429, 'busy');

	try {
		const id = await send(values, params.lang === 'en');
		console.log(`[contact] sent ${id}, topic ${values.topic || 'none'}`);
		return sent(values);
	} catch (e) {
		console.error('[contact] send failed:', (e as Error).message);
		return failed(502, 'failed');
	}
}
