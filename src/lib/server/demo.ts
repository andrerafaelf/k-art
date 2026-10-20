import type { L, Product } from '#lib/content.ts';
import { DEMO_PREFIX } from '#lib/shop.ts';
import { LOGO_MARK } from '#lib/brand.ts';
import { saveUpload } from './store.ts';

// Example products, to try the shop and the list before the real stock is in.
// They are loaded and removed from the admin's Shop page; their ids start
// with "demo-" so they can always be told apart from real ones. Their photos
// are simple drawings made here and saved as uploads like any other photo.
// Between them they cover every case: plenty in stock, last units, sold out,
// made to order, sizes with their own prices, used, price on request, a
// discount and a hidden product.

const INK = '#141518';
const STEEL = '#b9bdc3';
const BLUE = '#44b8f3';
const LIME = '#d6f906';

/** A studio shot: warm paper backdrop and a soft shadow under the object */
const shot = (body: string, shadow = 260) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
<defs>
<radialGradient id="bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#f5f4ef"/><stop offset="1" stop-color="#d8d6ce"/></radialGradient>
<radialGradient id="sh"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<rect width="800" height="800" fill="url(#bg)"/>
<ellipse cx="400" cy="690" rx="${shadow}" ry="30" fill="url(#sh)"/>
${body}
</svg>`;

const mark = (x: number, y: number, scale: number, fill: string) =>
	`<g transform="translate(${x} ${y}) scale(${scale})" fill="${fill}">${LOGO_MARK.map((d) => `<path d="${d}"/>`).join('')}</g>`;

/** Points around a circle, alternating between two radii, for teeth and ticks */
const ring = (n: number, r1: number, r2: number, cx = 400, cy = 380) =>
	Array.from({ length: n * 2 }, (_, i) => {
		const a = (Math.PI * i) / n;
		const r = i % 2 ? r2 : r1;
		return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
	}).join(' ');

const DRAWINGS = {
	slick: tyre('MG  ·  SH RED', '#e4002b'),
	wet: tyre('MG  ·  WT', BLUE),
	helmet: shot(`
<path d="M170 470C170 250 330 150 470 160C610 170 660 280 650 400L640 470C620 520 560 540 500 540H250C200 540 170 510 170 470Z" fill="${BLUE}"/>
<path d="M200 330C260 220 380 178 480 184" stroke="${LIME}" stroke-width="24" fill="none" stroke-linecap="round"/>
<path d="M380 300C470 280 600 300 645 350L640 430C560 420 470 425 380 440Z" fill="#101418"/>
<path d="M420 318C500 302 580 318 620 348" stroke="#fff" stroke-opacity=".28" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M250 540H500C560 540 610 520 640 470H600C570 500 530 510 480 510H260Z" fill="#0b3a5c"/>
${mark(230, 400, 0.32, '#fff')}`),
	tee: shot(`
<path d="M290 190H510C520 230 560 245 600 235L690 300L640 400L590 375V650H210V375L160 400L110 300L200 235C240 245 280 230 290 190Z" fill="#0d0e10"/>
<path d="M330 192C342 228 458 228 470 192" fill="none" stroke="#2b2d31" stroke-width="10"/>
${mark(328, 300, 0.55, LIME)}
<rect x="210" y="470" width="236" height="12" fill="${BLUE}"/><rect x="446" y="470" width="4" height="12" fill="#fff"/><rect x="450" y="470" width="140" height="12" fill="${LIME}"/>`),
	cap: shot(`
<path d="M200 480C200 300 300 220 410 220C530 220 610 320 610 460Z" fill="#0d0e10"/>
<path d="M560 450C640 446 705 466 730 500C690 512 610 506 540 490Z" fill="#1f2125"/>
<path d="M200 480L610 460L612 488L202 508Z" fill="${BLUE}"/>
<circle cx="410" cy="223" r="11" fill="#1f2125"/>
${mark(318, 330, 0.5, LIME)}`, 240),
	wheel: shot(`
<path fill-rule="evenodd" fill="${INK}" d="M170 380C170 240 270 190 400 190S630 240 630 380 530 570 400 570 170 520 170 380ZM235 380C235 465 305 505 400 505S565 465 565 380 495 255 400 255 235 295 235 380Z"/>
<path d="M178 330C172 360 172 400 178 430M622 330C628 360 628 400 622 430" stroke="${LIME}" stroke-width="8" fill="none" stroke-linecap="round"/>
<rect x="230" y="368" width="110" height="24" rx="8" fill="${STEEL}"/><rect x="460" y="368" width="110" height="24" rx="8" fill="${STEEL}"/>
<rect x="388" y="430" width="24" height="80" rx="8" fill="${STEEL}"/>
<circle cx="400" cy="380" r="72" fill="#cfd2d6"/><circle cx="400" cy="380" r="22" fill="#6f747b"/>
${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${400 + 48 * Math.cos((i * Math.PI) / 3)}" cy="${380 + 48 * Math.sin((i * Math.PI) / 3)}" r="7" fill="#8d9299"/>`).join('')}`),
	seat: shot(`
<path d="M250 170C330 148 470 148 550 170L525 610C475 662 325 662 275 610Z" fill="#d3d6da"/>
<path d="M298 214C362 198 438 198 502 214L486 566C446 600 354 600 314 566Z" fill="#b6bac0"/>
<circle cx="330" cy="300" r="11" fill="#8a8f96"/><circle cx="470" cy="300" r="11" fill="#8a8f96"/>
<circle cx="340" cy="470" r="11" fill="#8a8f96"/><circle cx="460" cy="470" r="11" fill="#8a8f96"/>
<text x="400" y="400" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="34" letter-spacing="4" fill="${INK}">TILLETT</text>`, 200),
	pads: shot(`
<g transform="rotate(-8 290 400)"><rect x="160" y="290" width="250" height="200" rx="44" fill="#6a7078"/><rect x="182" y="312" width="206" height="156" rx="32" fill="#2a2d31"/><circle cx="200" cy="300" r="14" fill="#8d9299"/></g>
<g transform="rotate(8 510 400)"><rect x="390" y="290" width="250" height="200" rx="44" fill="#6a7078"/><rect x="412" y="312" width="206" height="156" rx="32" fill="#2a2d31"/><circle cx="620" cy="300" r="14" fill="#8d9299"/></g>`),
	sprocket: shot(`
<path d="M400 600C600 600 700 500 700 380" stroke="#8d929a" stroke-width="26" stroke-dasharray="24 10" fill="none"/>
<polygon points="${ring(40, 230, 208)}" fill="#33373d"/>
<circle cx="400" cy="380" r="170" fill="#3d4249"/>
${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${400 + 110 * Math.cos((i * Math.PI) / 3 + 0.5)}" cy="${380 + 110 * Math.sin((i * Math.PI) / 3 + 0.5)}" r="36" fill="#d8d6ce"/>`).join('')}
<circle cx="400" cy="380" r="56" fill="#d8d6ce"/><circle cx="400" cy="380" r="56" fill="none" stroke="#2a2d31" stroke-width="10"/>`),
	carb: shot(`
<rect x="250" y="250" width="300" height="250" rx="34" fill="${STEEL}"/>
<circle cx="400" cy="375" r="86" fill="#2a2d31"/><circle cx="400" cy="375" r="64" fill="#55595f"/>
<rect x="295" y="500" width="210" height="76" rx="16" fill="#a2a7ae"/>
<circle cx="285" cy="285" r="10" fill="#7a7f86"/><circle cx="515" cy="285" r="10" fill="#7a7f86"/><circle cx="285" cy="465" r="10" fill="#7a7f86"/><circle cx="515" cy="465" r="10" fill="#7a7f86"/>
<path d="M550 300L640 250" stroke="#7a7f86" stroke-width="20" stroke-linecap="round"/><circle cx="640" cy="250" r="18" fill="#7a7f86"/>`, 220),
	gauge: shot(`
<path d="M400 560C400 650 530 660 580 600" stroke="#111" stroke-width="26" fill="none" stroke-linecap="round"/>
<circle cx="400" cy="360" r="215" fill="#1a1c1f"/><circle cx="400" cy="360" r="188" fill="#f7f7f4"/>
${Array.from({ length: 21 }, (_, i) => {
	const a = ((150 + i * 12) * Math.PI) / 180;
	const r1 = i % 5 ? 160 : 148;
	return `<line x1="${400 + r1 * Math.cos(a)}" y1="${360 + r1 * Math.sin(a)}" x2="${400 + 176 * Math.cos(a)}" y2="${360 + 176 * Math.sin(a)}" stroke="#1a1c1f" stroke-width="${i % 5 ? 4 : 8}"/>`;
}).join('')}
<line x1="400" y1="360" x2="${400 + 140 * Math.cos((250 * Math.PI) / 180)}" y2="${360 + 140 * Math.sin((250 * Math.PI) / 180)}" stroke="#e4002b" stroke-width="8" stroke-linecap="round"/>
<circle cx="400" cy="360" r="18" fill="#1a1c1f"/>
<text x="400" y="470" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="30" fill="#55595f">bar</text>`, 220),
	kart: shot(`
<path d="M300 150H500L540 210H260Z" fill="${BLUE}"/>
<rect x="185" y="185" width="64" height="104" rx="16" fill="${INK}"/><rect x="551" y="185" width="64" height="104" rx="16" fill="${INK}"/>
<rect x="160" y="500" width="84" height="130" rx="18" fill="${INK}"/><rect x="556" y="500" width="84" height="130" rx="18" fill="${INK}"/>
<path d="M249 237H551M244 565H556" stroke="#6b7078" stroke-width="14"/>
<path d="M300 210L270 330L282 565M500 210L530 330L518 565M270 330H530M282 470H518" stroke="#a9aeb5" stroke-width="16" fill="none" stroke-linejoin="round"/>
<path d="M232 380H300V520H232ZM500 380H568V520H500Z" fill="${BLUE}"/>
<ellipse cx="400" cy="470" rx="62" ry="84" fill="#2a2d31"/>
<rect x="350" y="318" width="100" height="26" rx="13" fill="${INK}"/>
<rect x="340" y="590" width="120" height="50" rx="10" fill="#55595f"/>`, 300)
};

/** A wheel and slick seen from the side, with the brand along the sidewall */
function tyre(label: string, colour: string) {
	return shot(`
<circle cx="400" cy="380" r="275" fill="${INK}"/>
<circle cx="400" cy="380" r="268" fill="none" stroke="#2b2c30" stroke-width="5"/>
<circle cx="400" cy="380" r="205" fill="#1c1d21"/>
<path id="arc" d="M172 380A228 228 0 0 1 628 380" fill="none"/>
<text font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="34" letter-spacing="5" fill="${colour}"><textPath href="#arc" startOffset="50%" text-anchor="middle">${label}</textPath></text>
<circle cx="400" cy="380" r="152" fill="#c9ccd1"/><circle cx="400" cy="380" r="134" fill="#b0b4ba"/>
${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${400 + 86 * Math.cos((i * Math.PI) / 3)}" cy="${380 + 86 * Math.sin((i * Math.PI) / 3)}" r="27" fill="#8a8f96"/>`).join('')}
<circle cx="400" cy="380" r="36" fill="#d9dce0"/><circle cx="400" cy="380" r="14" fill="#6f747b"/>`, 290);
}

type Drawing = keyof typeof DRAWINGS;

const l = (pt: string, en: string): L => ({ pt, en });
const none = l('', '');

/** The example products, before their photos are saved */
const EXAMPLES: (Omit<Product, 'photos'> & { draw: Drawing[] })[] = [
	{
		id: 'demo-pneus-slick',
		slug: 'exemplo-jogo-pneus-mg-sh-red',
		name: l('Jogo de pneus MG SH Red', 'MG SH Red tyre set'),
		description: l(
			'Jogo completo de quatro pneus slick **MG SH Red**, homologados para o Campeonato de Portugal de Karting.\n\n- Dois dianteiros 10x4.60-5\n- Dois traseiros 11x7.10-5\n\nNovos, por montar.',
			'A full set of four **MG SH Red** slicks, homologated for the Portuguese karting championship.\n\n- Two fronts 10x4.60-5\n- Two rears 11x7.10-5\n\nNew, unmounted.'
		),
		category: 'tyres',
		brand: 'MG',
		ref: 'SH-RED-SET',
		fits: ['Rotax Max', 'IAME X30'],
		condition: 'new',
		conditionNote: none,
		price: 18900,
		stock: 6,
		options: [],
		optionName: none,
		onOrder: false,
		visible: true,
		draw: ['slick']
	},
	{
		id: 'demo-pneus-chuva',
		slug: 'exemplo-jogo-pneus-mg-wet',
		name: l('Jogo de pneus de chuva MG Wet', 'MG Wet rain tyre set'),
		description: l('Pneus de chuva para os fins de semana em que o Faial não perdoa. Encomendamos para a prova seguinte.', 'Rain tyres for the weekends when Faial shows no mercy. We order them in for the next round.'),
		category: 'tyres',
		brand: 'MG',
		ref: 'WT-SET',
		fits: ['Rotax Max', 'IAME X30'],
		condition: 'new',
		conditionNote: none,
		price: 21500,
		stock: 0,
		options: [],
		optionName: none,
		onOrder: true,
		visible: true,
		draw: ['wet']
	},
	{
		id: 'demo-capacete',
		slug: 'exemplo-capacete-bell-kc7-cmr',
		name: l('Capacete Bell KC7-CMR', 'Bell KC7-CMR helmet'),
		description: l('Capacete homologado CMR para pilotos até aos 15 anos, leve e com ventilação regulável.', 'CMR homologated helmet for drivers up to 15, light, with adjustable vents.'),
		category: 'gear',
		brand: 'Bell',
		ref: 'KC7-CMR',
		fits: ['Cadete', 'Júnior'],
		condition: 'new',
		conditionNote: none,
		price: 54900,
		was: 59900,
		stock: 0,
		options: [
			{ id: 'demo-54', label: '54', stock: 1 },
			{ id: 'demo-56', label: '56', stock: 2 },
			{ id: 'demo-58', label: '58', stock: 0 }
		],
		optionName: none,
		onOrder: false,
		visible: true,
		draw: ['helmet']
	},
	{
		id: 'demo-tshirt',
		slug: 'exemplo-t-shirt-kart-2026',
		name: l("T-shirt K'ART Racing Team 2026", "K'ART Racing Team 2026 T-shirt"),
		description: l('A t-shirt da equipa, em algodão, com o K e as cores da pintura dos karts.', "The team T-shirt, in cotton, with the K and the karts' livery colours."),
		category: 'merch',
		fits: [],
		condition: 'new',
		conditionNote: none,
		price: 2500,
		stock: 0,
		options: [
			{ id: 'demo-s', label: 'S', stock: 5 },
			{ id: 'demo-m', label: 'M', stock: 8 },
			{ id: 'demo-l', label: 'L', stock: 3 },
			{ id: 'demo-xl', label: 'XL', stock: 0 }
		],
		optionName: none,
		onOrder: true,
		visible: true,
		draw: ['tee', 'cap']
	},
	{
		id: 'demo-bone',
		slug: 'exemplo-bone-kart',
		name: l("Boné K'ART", "K'ART cap"),
		description: none,
		category: 'merch',
		fits: [],
		condition: 'new',
		conditionNote: none,
		price: 1800,
		stock: 12,
		options: [],
		optionName: none,
		onOrder: false,
		visible: true,
		draw: ['cap']
	},
	{
		id: 'demo-volante',
		slug: 'exemplo-volante-tony-kart-320',
		name: l('Volante Tony Kart 320 mm', 'Tony Kart 320 mm steering wheel'),
		description: l('Volante original OTK, punhos em camurça.', 'Original OTK wheel, suede grips.'),
		category: 'chassis',
		brand: 'OTK',
		ref: 'OTK-SW-320',
		fits: ['OTK'],
		condition: 'new',
		conditionNote: none,
		price: 11500,
		stock: 0,
		options: [],
		optionName: none,
		onOrder: false,
		visible: true,
		draw: ['wheel']
	},
	{
		id: 'demo-banco',
		slug: 'exemplo-banco-tillett-t11',
		name: l('Banco Tillett T11 VG', 'Tillett T11 VG seat'),
		description: l('Banco em fibra de vidro, rígido. As medidas maiores custam mais.', 'Rigid fibreglass seat. The larger sizes cost more.'),
		category: 'chassis',
		brand: 'Tillett',
		fits: ['OTK', 'Kosmic', 'CRG'],
		condition: 'new',
		conditionNote: none,
		price: 16900,
		stock: 0,
		options: [
			{ id: 'demo-tm', label: 'M', stock: 2 },
			{ id: 'demo-tl', label: 'L', stock: 1, price: 17900 },
			{ id: 'demo-txl', label: 'XL', stock: 1, price: 18900 }
		],
		optionName: l('Medida', 'Size'),
		onOrder: false,
		visible: true,
		draw: ['seat']
	},
	{
		id: 'demo-pastilhas',
		slug: 'exemplo-pastilhas-otk-bss',
		name: l('Pastilhas de travão OTK BSS', 'OTK BSS brake pads'),
		description: l('Par de pastilhas traseiras para o sistema BSS.', 'A pair of rear pads for the BSS system.'),
		category: 'chassis',
		brand: 'OTK',
		ref: 'OTK-BSS-PAD',
		fits: ['OTK'],
		condition: 'new',
		conditionNote: none,
		price: 3200,
		stock: 2,
		options: [],
		optionName: none,
		onOrder: false,
		visible: true,
		draw: ['pads']
	},
	{
		id: 'demo-carreto',
		slug: 'exemplo-carreto-80-dentes',
		name: l('Carreto de 80 dentes, 219', '80 tooth sprocket, 219'),
		description: none,
		category: 'engine',
		brand: 'OTK',
		ref: 'SP-219-80',
		fits: ['Rotax Max', 'IAME X30'],
		condition: 'new',
		conditionNote: none,
		price: 3990,
		stock: 9,
		options: [],
		optionName: none,
		onOrder: false,
		visible: true,
		draw: ['sprocket']
	},
	{
		id: 'demo-carburador',
		slug: 'exemplo-carburador-tillotson-hw27a',
		name: l('Carburador Tillotson HW-27A', 'Tillotson HW-27A carburettor'),
		description: l('Limpo e afinado na nossa oficina.', 'Cleaned and set up in our workshop.'),
		category: 'engine',
		brand: 'Tillotson',
		ref: 'HW-27A',
		fits: ['IAME X30'],
		condition: 'used',
		conditionNote: l('Uma época de regional. Membranas novas.', 'One regional season. New diaphragms.'),
		price: 9500,
		stock: 1,
		options: [],
		optionName: none,
		onOrder: false,
		visible: true,
		draw: ['carb']
	},
	{
		id: 'demo-medidor',
		slug: 'exemplo-medidor-pressao-digital',
		name: l('Medidor de pressão de pneus', 'Tyre pressure gauge'),
		description: l('Escala de 0 a 2 bar, com mangueira e válvula de descarga.', 'Reads 0 to 2 bar, with hose and bleed valve.'),
		category: 'tools',
		brand: 'AIM',
		fits: [],
		condition: 'new',
		conditionNote: none,
		price: 4990,
		stock: 14,
		options: [],
		optionName: none,
		onOrder: false,
		visible: true,
		draw: ['gauge']
	},
	{
		id: 'demo-kart',
		slug: 'exemplo-kart-tony-kart-racer-401r',
		name: l('Kart Tony Kart Racer 401R com motor Rotax', 'Tony Kart Racer 401R with Rotax engine'),
		description: l(
			'Kart completo, pronto a correr.\n\n- Chassis Tony Kart Racer 401R\n- Motor Rotax Max Evo, revisto\n- Jantes e pneus usados\n\nPode ser visto no Kartódromo do Faial.',
			'Complete kart, ready to race.\n\n- Tony Kart Racer 401R chassis\n- Rotax Max Evo engine, rebuilt\n- Used wheels and tyres\n\nCan be seen at the Kartódromo do Faial.'
		),
		category: 'karts',
		brand: 'OTK',
		fits: ['OTK', 'Rotax Max', 'Sénior'],
		condition: 'used',
		conditionNote: l('Uma época no regional. Sem fissuras nem soldaduras, eixo novo.', 'One regional season. No cracks or welds, new axle.'),
		stock: 1,
		options: [],
		optionName: none,
		onOrder: false,
		visible: true,
		draw: ['kart', 'wheel', 'carb']
	},
	{
		id: 'demo-luvas',
		slug: 'exemplo-luvas-alpinestars',
		name: l('Luvas Alpinestars Tech-1 K', 'Alpinestars Tech-1 K gloves'),
		description: l('Um artigo oculto, sem fotografia: só se vê com a sessão iniciada.', 'A hidden product without a photo: only visible while signed in.'),
		category: 'gear',
		brand: 'Alpinestars',
		fits: [],
		condition: 'new',
		conditionNote: none,
		price: 5990,
		stock: 4,
		options: [],
		optionName: none,
		onOrder: false,
		visible: false,
		draw: []
	}
];

/** The example products with their photos saved, leaving out any already in the shop. */
export async function demoProducts(existing: Product[]): Promise<Product[]> {
	const have = new Set(existing.map((p) => p.id));
	const photos = new Map<Drawing, string>();
	const photo = async (d: Drawing) => {
		if (!photos.has(d)) {
			const file = new File([DRAWINGS[d]], `${d}.svg`, { type: 'image/svg+xml' });
			photos.set(d, await saveUpload(file, { allowSvg: true }));
		}
		return photos.get(d)!;
	};

	const out: Product[] = [];
	for (const { draw, ...p } of EXAMPLES) {
		if (have.has(p.id)) continue;
		out.push({ ...p, photos: await Promise.all(draw.map(photo)) });
	}
	return out;
}
