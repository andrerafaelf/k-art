import { error, fail, type RequestEvent } from '@sveltejs/kit';
import type { Lang, Product } from '#lib/content.ts';
import { HONEYPOT } from '#lib/contact.ts';
import {
	REQUEST_LIMITS,
	decodeList,
	encodeList,
	linesOf,
	money,
	orderable,
	parsePhone,
	phoneDisplay,
	totals,
	type Line,
	type RequestFailed,
	type RequestSent,
	type RequestValues
} from '#lib/shop.ts';
import { getContent } from './store.ts';
import { addRequest, type ShopRequest } from './requests.ts';
import { EMAIL, escape, human, layout, limited, sendToTeam } from './mail.ts';

// The shop on the public site: closed (a 404) while it is switched off in the
// admin, except for people signed in, who see it as a preview. Visitors send
// their list with the form on the list page; it is saved in the admin's
// Requests and emailed to the team.

/** The site's content, or a 404 while the shop is switched off. */
export async function openShop(signedIn: boolean) {
	const content = await getContent();
	if (!content.shop.enabled && !signedIn) error(404, 'Not found');
	return content;
}

/** What the catalogue needs of a product, without the long description */
export const summary = ({ description: _, ...rest }: Product) => rest;

// ---------- the form ----------

function read(data: FormData): RequestValues {
	const text = (name: string) => String(data.get(name) ?? '').trim();
	return {
		name: text('name').replace(/\s+/g, ' ').slice(0, REQUEST_LIMITS.name),
		email: text('email').slice(0, REQUEST_LIMITS.email),
		phone: text('phone').slice(0, REQUEST_LIMITS.phone),
		message: text('message').replace(/\r\n/g, '\n')
	};
}

function check(values: RequestValues) {
	const errors: RequestFailed['errors'] = {};
	if (!values.name) errors.name = 'name';
	if (!EMAIL.test(values.email)) errors.email = 'email';
	if (values.phone && parsePhone(values.phone) === undefined) errors.phone = 'phone';
	if (values.message.length > REQUEST_LIMITS.message) errors.message = 'long';
	return errors;
}

// ---------- the email ----------

const lineText = (l: Line) =>
	[
		`${l.qty} × ${l.product!.name.pt || l.product!.name.en}`,
		l.option && `(${l.option.label})`,
		l.product!.ref && `ref. ${l.product!.ref}`,
		l.unit === undefined ? 'preço sob consulta' : `${money(l.unit, 'pt')} = ${money(l.total!, 'pt')}`
	]
		.filter(Boolean)
		.join(', ');

// The team reads these in Portuguese, whichever language the visitor used
function compose(saved: ShopRequest, lines: Line[], adminUrl: string) {
	const sum = totals(lines);
	const subject = `Pedido n.º ${saved.number} · ${saved.name}`;
	const note = saved.lang === 'en' ? 'Enviado na versão inglesa do site, talvez prefira resposta em inglês.' : '';
	const phone = saved.phone ? phoneDisplay(parsePhone(saved.phone) || '') || saved.phone : '';
	const totalLine = `Total estimado: ${money(sum.total, 'pt')}${sum.onRequest ? `, mais ${sum.onRequest} com preço sob consulta` : ''} (IVA incluído)`;

	const text = [
		`${saved.name} <${saved.email}>`,
		...(phone ? [`Telefone: ${phone}`] : []),
		...(note ? [note] : []),
		'',
		...lines.map(lineText),
		'',
		totalLine,
		...(saved.message ? ['', saved.message] : []),
		'',
		`Ver no admin: ${adminUrl}`,
		`Enviado pela loja em k-artracing.com. Responda a este email para responder diretamente a ${saved.name}.`
	].join('\n');

	const n = escape(saved.name);
	const e = escape(saved.email);
	const cell = 'padding:10px 8px;border-bottom:1px solid #e4e3dd;vertical-align:top';
	const rows = lines
		.map((l) => {
			const p = l.product!;
			const detail = [l.option?.label, p.ref && `ref. ${p.ref}`, p.condition === 'used' && 'usado'].filter(Boolean).join(' · ');
			return `<tr>
<td style="${cell};font-weight:700;white-space:nowrap">${l.qty} ×</td>
<td style="${cell}"><strong>${escape(p.name.pt || p.name.en)}</strong>${detail ? `<br><span style="font-size:13px;color:#57534e">${escape(detail)}</span>` : ''}</td>
<td style="${cell};text-align:right;white-space:nowrap">${l.total === undefined ? '<span style="color:#57534e">sob consulta</span>' : money(l.total, 'pt')}</td>
</tr>`;
		})
		.join('');

	const html = layout(
		`Pedido n.º ${saved.number}`,
		`<p style="margin:0;font-size:18px;font-weight:700">${n}</p>
<p style="margin:2px 0 0"><a href="mailto:${e}" style="color:#0478fb">${e}</a>${phone ? ` · <a href="tel:+${parsePhone(saved.phone ?? '')}" style="color:#0478fb">${escape(phone)}</a>` : ''}</p>
${note ? `<p style="margin:10px 0 0;font-size:13px;color:#57534e">${note}</p>` : ''}
<table style="width:100%;margin:20px 0 0;border-collapse:collapse;font-size:15px">${rows}</table>
<p style="margin:14px 0 0;text-align:right;font-size:17px;font-weight:700">Total estimado ${money(sum.total, 'pt')}</p>
<p style="margin:2px 0 0;text-align:right;font-size:13px;color:#57534e">IVA incluído${sum.onRequest ? `, mais ${sum.onRequest} com preço sob consulta` : ''}</p>
${saved.message ? `<div style="margin:20px 0 0;padding:16px 18px;background:#f4f4ef;border-left:3px solid #0a0a0b">${escape(saved.message).replace(/\n/g, '<br>')}</div>` : ''}
<p style="margin:24px 0 0"><a href="${escape(adminUrl)}" style="display:inline-block;padding:10px 16px;background:#0a0a0b;color:#d6f906;font-weight:700;text-decoration:none">Abrir no admin</a></p>
<p style="margin:20px 0 0;font-size:13px;color:#57534e">Enviado pela loja em k-artracing.com. Responda a este email para responder diretamente a ${n}.</p>`
	);

	return { subject, text, html };
}

// ---------- the action ----------

const sent = (values: RequestValues, number: number, items: string): { request: RequestSent } => ({
	request: { sent: true, number, name: values.name, email: values.email, items }
});

/** The `request` form action on the list page. */
export async function request({ request, params, locals, url, getClientAddress }: RequestEvent) {
	const content = await openShop(!!locals.user);
	const lang: Lang = params.lang === 'en' ? 'en' : 'pt';
	const data = await request.formData();
	const values = read(data);

	// The list as the page showed it, checked against the shop as it is now
	const lines = linesOf(decodeList(String(data.get('items') ?? '')), content.products);
	const ok = orderable(lines);
	const items = encodeList(ok.map((l) => ({ ...l.item, qty: l.qty })));

	// Bots fill in every field, including the hidden one. Let them think it worked.
	if (String(data.get(HONEYPOT) ?? '')) return sent(values, 0, items);

	const errors = check(values);
	const failed = (status: number, error?: RequestFailed['error']) =>
		fail(status, { request: { values, errors, ...(error && { error }) } satisfies RequestFailed });

	if (Object.keys(errors).length) return failed(400);
	if (!ok.length) return failed(400, 'empty');
	if (lines.some((l) => l.problem)) return failed(409, 'changed');

	const address = getClientAddress();
	if (!(await human(String(data.get('cf-turnstile-response') ?? ''), address))) return failed(403, 'bot');
	if (limited(address)) return failed(429, 'busy');

	let saved: ShopRequest;
	try {
		saved = await addRequest({
			lang,
			name: values.name,
			email: values.email,
			...(values.phone && { phone: values.phone }),
			...(values.message && { message: values.message }),
			lines: ok.map((l) => ({
				productId: l.product!.id,
				...(l.option && { optionId: l.option.id, option: l.option.label }),
				name: l.product!.name,
				...(l.product!.ref && { ref: l.product!.ref }),
				qty: l.qty,
				...(l.unit !== undefined && { unit: l.unit })
			})),
			total: totals(ok).total
		});
	} catch (e) {
		console.error('[shop] could not save a request:', (e as Error).message);
		return failed(502, 'failed');
	}

	// The request is in the admin either way; the email is a heads-up
	try {
		const id = await sendToTeam({
			from: values.name,
			replyTo: values.email,
			...compose(saved, ok, `${url.origin}/admin/shop/requests/${saved.id}`)
		});
		console.log(`[shop] request ${saved.number} sent ${id}`);
	} catch (e) {
		console.error(`[shop] request ${saved.number} saved, but the email failed:`, (e as Error).message);
	}
	return sent(values, saved.number, items);
}
