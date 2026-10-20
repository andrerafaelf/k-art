import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { tr } from '#lib/content.ts';
import { textIn } from '#lib/texts.ts';
import { messages } from '#lib/i18n.ts';
import { getContent } from '#lib/server/store.ts';
import { getRequests } from '#lib/server/requests.ts';
import { listPdf, pdfResponse } from '#lib/server/pdf.ts';

// A request as a PDF, exactly as it was sent: its names and prices from that
// day, in the language it was sent in, to forward or print
export const GET: RequestHandler = async ({ params, url }) => {
	const request = (await getRequests()).find((r) => r.id === params.id);
	if (!request) error(404, 'Request not found');
	const content = await getContent();
	const lang = request.lang;
	const t = messages[lang].shop;

	const bytes = await listPdf({
		lang,
		rows: request.lines.map((l) => ({
			qty: l.qty,
			name: tr(l.name, lang),
			detail: [l.option, l.ref && t.pdf.ref(l.ref)].filter(Boolean).join('  ·  '),
			unit: l.unit
		})),
		number: request.number,
		terms: textIn(content.texts, 'shop.terms', lang),
		email: content.settings.email,
		whatsapp: content.shop.whatsapp,
		host: url.host
	});
	return pdfResponse(bytes, `${t.pdf.file}-${request.number}.pdf`);
};
