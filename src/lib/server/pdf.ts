import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { longDate, madeiraToday, tr, type Lang } from '#lib/content.ts';
import { LOGO_MARK, LOGO_TAG, LOGO_W, LOGO_WORD } from '#lib/brand.ts';
import { messages } from '#lib/i18n.ts';
import { OPTION_NAME, money, orderable, phoneDisplay, type Line } from '#lib/shop.ts';

// A shopping list as an A4 PDF: the logo on a black band with the lime rule
// from the team's emails, a table of what is on the list, the estimated total
// and how payment and pickup work. Built on the server so it comes out the
// same on every phone and computer.

const A4 = [595.28, 841.89] as const;
const M = 46;
const BAND = 96;

const BLACK = rgb(0.04, 0.04, 0.043);
const INK = rgb(0.043, 0.043, 0.047);
const GREY = rgb(0.34, 0.33, 0.31);
const HAIR = rgb(0.89, 0.89, 0.87);
const PAPER = rgb(0.957, 0.957, 0.937);
const WHITE = rgb(0.953, 0.953, 0.937);
const LIME = rgb(0.839, 0.976, 0.024);
const BLUE = rgb(0.267, 0.722, 0.953);

/** One line of the PDF */
export interface PdfRow {
	qty: number;
	name: string;
	/** Size, brand, part number, condition */
	detail: string;
	/** Price of one in cents, missing when on request */
	unit?: number;
}

/** The rows for a list checked against the shop: what can still be had, as it is now */
export function rowsOf(lines: Line[], lang: Lang): PdfRow[] {
	const t = messages[lang].shop;
	return orderable(lines).map((l) => {
		const p = l.product!;
		return {
			qty: l.qty,
			name: tr(p.name, lang),
			detail: [
				l.option && `${tr(p.optionName, lang) || OPTION_NAME[lang]}: ${l.option.label}`,
				p.brand,
				p.ref && t.pdf.ref(p.ref),
				p.condition === 'used' && t.used
			]
				.filter(Boolean)
				.join('  ·  '),
			unit: l.unit
		};
	});
}

interface ListPdf {
	lang: Lang;
	rows: PdfRow[];
	/** For a list that was sent: its request number */
	number?: number;
	/** How payment and pickup work, from the site texts */
	terms: string;
	email: string;
	whatsapp: string;
	host: string;
}

export async function listPdf({ lang, rows, number, terms, email, whatsapp, host }: ListPdf) {
	const t = messages[lang].shop;
	const doc = await PDFDocument.create();
	const regular = await doc.embedFont(StandardFonts.Helvetica);
	const bold = await doc.embedFont(StandardFonts.HelveticaBold);

	// The built-in fonts only have Western European letters; anything else becomes a question mark
	const known = new Set(regular.getCharacterSet());
	const safe = (s: string) =>
		[...s.replace(/[  ]/g, ' ')].map((c) => (known.has(c.codePointAt(0)!) ? c : '?')).join('');

	const width = (s: string, font: PDFFont, size: number) => font.widthOfTextAtSize(safe(s), size);

	/** Breaks text into lines that fit, at spaces */
	function wrap(s: string, font: PDFFont, size: number, max: number) {
		const out: string[] = [];
		let current = '';
		for (const word of s.split(/\s+/).filter(Boolean)) {
			const next = current ? `${current} ${word}` : word;
			if (current && width(next, font, size) > max) {
				out.push(current);
				current = word;
			} else current = next;
		}
		if (current) out.push(current);
		return out;
	}

	const pages: PDFPage[] = [];
	let page!: PDFPage;
	let y = 0;
	const [W, H] = A4;

	function text(s: string, x: number, at: number, size: number, font = regular, color = INK, align: 'left' | 'right' = 'left') {
		const clean = safe(s);
		const left = align === 'right' ? x - font.widthOfTextAtSize(clean, size) : x;
		page.drawText(clean, { x: left, y: at, size, font, color });
	}

	function newPage() {
		page = doc.addPage([W, H]);
		pages.push(page);
		page.drawRectangle({ x: 0, y: H - BAND, width: W, height: BAND, color: BLACK });
		page.drawRectangle({ x: 0, y: H - BAND - 4, width: W, height: 4, color: LIME });

		// The full-colour logo: lime K, blue ART, the tag line in white
		const at = { x: M, y: H - 31, scale: 150 / LOGO_W };
		for (const d of LOGO_MARK) page.drawSvgPath(d, { ...at, color: LIME });
		for (const d of LOGO_WORD) page.drawSvgPath(d, { ...at, color: BLUE });
		for (const d of LOGO_TAG) page.drawSvgPath(d, { ...at, color: WHITE });

		text(t.pdf.title.toUpperCase(), W - M, H - 40, 10, bold, LIME, 'right');
		text(longDate(madeiraToday(), lang), W - M, H - 55, 9, regular, WHITE, 'right');
		if (number) text(t.pdf.request(number), W - M, H - 69, 9, regular, WHITE, 'right');
		y = H - BAND - 4 - 40;
	}

	// Columns: quantity, item, price of one, line total
	const col = { qty: M, item: M + 38, each: W - M - 92, total: W - M };
	const itemWidth = col.each - 70 - col.item;

	function tableHead() {
		text(t.pdf.qty.toUpperCase(), col.qty, y, 7.5, bold, GREY);
		text(t.pdf.item.toUpperCase(), col.item, y, 7.5, bold, GREY);
		text(t.pdf.each.toUpperCase(), col.each, y, 7.5, bold, GREY, 'right');
		text(t.pdf.total.toUpperCase(), col.total, y, 7.5, bold, GREY, 'right');
		y -= 9;
		page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1.2, color: INK });
		y -= 18;
	}

	newPage();

	if (!rows.length) {
		text(t.list.empty, M, y, 11, regular, GREY);
		y -= 30;
	} else tableHead();

	for (const row of rows) {
		const name = wrap(row.name, bold, 10.5, itemWidth).slice(0, 3);
		const height = name.length * 13 + (row.detail ? 12 : 0) + 14;
		if (y - height < 90) {
			newPage();
			tableHead();
		}

		text(String(row.qty), col.qty, y, 10.5, bold);
		name.forEach((n, i) => text(n, col.item, y - i * 13, 10.5, bold));
		if (row.detail) text(row.detail, col.item, y - name.length * 13 - 1, 8.5, regular, GREY);
		if (row.unit === undefined) {
			text(t.onRequest, col.total, y, 9.5, regular, GREY, 'right');
		} else {
			text(money(row.unit, lang), col.each, y, 10.5, regular, INK, 'right');
			text(money(row.unit * row.qty, lang), col.total, y, 10.5, bold, INK, 'right');
		}
		y -= height - 10;
		page.drawLine({ start: { x: M, y: y + 4 }, end: { x: W - M, y: y + 4 }, thickness: 0.6, color: HAIR });
		y -= 14;
	}

	// The total, then how payment and pickup work
	const total = rows.reduce((n, r) => n + (r.unit ?? 0) * r.qty, 0);
	const onRequest = rows.filter((r) => r.unit === undefined).length;
	const termLines = wrap(terms, regular, 9, W - 2 * M - 30);
	const needed = (rows.length ? 70 : 0) + termLines.length * 13 + 40;
	if (y - needed < 70) newPage();

	if (rows.length) {
		y -= 6;
		text(t.list.estimate.toUpperCase(), col.total, y, 7.5, bold, GREY, 'right');
		y -= 24;
		text(money(total, lang), col.total, y, 22, bold, INK, 'right');
		y -= 15;
		text(t.vat, col.total, y, 8.5, regular, GREY, 'right');
		if (onRequest) {
			y -= 12;
			text(t.list.plusRequest(onRequest), col.total, y, 8.5, regular, GREY, 'right');
		}
		y -= 30;
	}

	if (termLines.length) {
		const boxHeight = termLines.length * 13 + 22;
		page.drawRectangle({ x: M, y: y - boxHeight + 12, width: W - 2 * M, height: boxHeight, color: PAPER });
		page.drawRectangle({ x: M, y: y - boxHeight + 12, width: 3, height: boxHeight, color: INK });
		termLines.forEach((line, i) => text(line, M + 18, y - 4 - i * 13, 9, regular, INK));
	}

	// Footer on every page: how to reach the team, and the page number
	const contact = [host, email, whatsapp && phoneDisplay(whatsapp)].filter(Boolean).join('   ·   ');
	pages.forEach((p, i) => {
		page = p;
		page.drawLine({ start: { x: M, y: 46 }, end: { x: W - M, y: 46 }, thickness: 0.6, color: HAIR });
		text(contact, M, 30, 8, regular, GREY);
		if (pages.length > 1) text(t.pdf.page(i + 1, pages.length), W - M, 30, 8, regular, GREY, 'right');
	});

	doc.setTitle(`${t.pdf.title}, K'ART Racing Team`);
	doc.setAuthor("K'ART Racing Team");
	doc.setCreator(host);
	doc.setProducer(host);
	doc.setLanguage(lang === 'pt' ? 'pt-PT' : 'en');
	return doc.save();
}

/** The response for a PDF download */
export const pdfResponse = (bytes: Uint8Array, file: string) =>
	new Response(new Uint8Array(bytes), {
		headers: {
			'content-type': 'application/pdf',
			'content-disposition': `attachment; filename="${file}"`,
			'cache-control': 'private, no-store',
			'x-robots-tag': 'noindex'
		}
	});
