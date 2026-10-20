import { fail, type RequestEvent } from '@sveltejs/kit';
import { HONEYPOT, LIMITS, TOPICS, type ContactFailed, type ContactSent, type ContactValues, type Topic } from '#lib/contact.ts';
import { EMAIL, escape, human, layout, limited, sendToTeam } from './mail.ts';

// The contact form on the home page. It checks the fields and the Cloudflare
// Turnstile token, limits how often one address can send, and passes the
// message to the team inbox (lib/server/mail.ts), with reply-to set to the sender.

// ---------- checks ----------

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

// ---------- the email ----------

// The team reads these in Portuguese, whichever language the visitor wrote in
const SUBJECTS: Record<Topic | '', string> = {
	drivers: 'Pilotos',
	partners: 'Parcerias',
	press: 'Imprensa',
	other: 'Outro assunto',
	'': 'Contacto'
};

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
	const html = layout(
		SUBJECTS[topic],
		`<p style="margin:0;font-size:18px;font-weight:700">${n}</p>
<p style="margin:2px 0 0"><a href="mailto:${e}" style="color:#0478fb">${e}</a></p>
${note ? `<p style="margin:10px 0 0;font-size:13px;color:#57534e">${note}</p>` : ''}
<div style="margin:20px 0;padding:16px 18px;background:#f4f4ef;border-left:3px solid #0a0a0b">${escape(message).replace(/\n/g, '<br>')}</div>
<p style="margin:0;font-size:13px;color:#57534e">Enviado pelo formulário de contacto em k-artracing.com. Responda a este email para responder diretamente a ${n}.</p>`
	);

	return { subject, text, html };
}

async function send(values: ContactValues, english: boolean) {
	const { subject, text, html } = compose(values, english);
	return sendToTeam({ from: values.name, replyTo: values.email, subject, text, html });
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
