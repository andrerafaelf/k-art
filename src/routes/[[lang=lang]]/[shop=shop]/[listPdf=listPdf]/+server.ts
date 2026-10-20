import type { RequestHandler } from './$types';
import { textIn } from '#lib/texts.ts';
import { messages } from '#lib/i18n.ts';
import { decodeList, linesOf } from '#lib/shop.ts';
import { openShop } from '#lib/server/shop.ts';
import { listPdf, pdfResponse, rowsOf } from '#lib/server/pdf.ts';

// The visitor's list as a PDF. The list comes in the link (?l=), since it only
// lives in their browser; prices and stock are read from the shop as it is now.
export const GET: RequestHandler = async ({ url, params, locals }) => {
	const content = await openShop(!!locals.user);
	const lang = params.lang === 'en' ? 'en' : 'pt';
	const n = Number(url.searchParams.get('n'));
	const number = Number.isInteger(n) && n > 0 ? n : undefined;

	const bytes = await listPdf({
		lang,
		rows: rowsOf(linesOf(decodeList(url.searchParams.get('l')), content.products), lang),
		number,
		terms: textIn(content.texts, 'shop.terms', lang),
		email: content.settings.email,
		whatsapp: content.shop.whatsapp,
		host: url.host
	});
	return pdfResponse(bytes, `${messages[lang].shop.pdf.file}${number ? `-${number}` : ''}.pdf`);
};
