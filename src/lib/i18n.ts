import { getContext, setContext } from 'svelte';
import type { Lang } from '#lib/content.ts';

// Interface text for the public site. Portuguese is the main language and
// English the fallback; content written in the admin falls back the same way
// (see `tr` in content.ts).

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const EN_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const PT_WORDS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const spellEn = (n: number) => EN_WORDS[n] ?? String(n);
/** Portuguese number words agree in gender for one and two */
const spellPt = (n: number, feminine = false) =>
	feminine && n === 1 ? 'uma' : feminine && n === 2 ? 'duas' : (PT_WORDS[n] ?? String(n));

const en = {
	meta: {
		title: "K'ART Racing Team, karting from Madeira",
		description:
			"K'ART Racing Team is a karting team from Madeira, Portugal, based at the Kartódromo do Faial and racing at home and on the mainland."
	},
	lang: { other: 'pt' as Lang, label: 'Português', short: 'PT' },
	nav: {
		team: 'Team',
		drivers: 'Drivers',
		season: 'Season',
		news: 'News',
		hall: 'Hall of Fame',
		madeira: 'Madeira',
		partners: 'Partners',
		contact: 'Contact',
		cta: 'Get in touch',
		open: 'Open menu',
		close: 'Close menu',
		home: "K'ART Racing Team, back to top"
	},
	hero: {
		meet: 'Meet the drivers',
		lightsOut: 'Lights out',
		season: (y: number) => `${y} season`,
		next: 'Next race',
		when: (days: number) => (days <= 0 ? 'This weekend' : days === 1 ? 'Tomorrow' : `In ${days} days`),
		done: 'Season complete',
		soFar: (y: number) => `${y} so far`,
		tally: (w: number, p: number) => `${plural(w, 'win', 'wins')}, ${plural(p, 'podium', 'podiums')}`,
		from: (r: number, n: number) => `from ${r} of ${plural(n, 'round', 'rounds')}`,
		lineUp: 'Line-up',
		drivers: (n: number) => plural(n, 'driver', 'drivers'),
		classes: (c: number) => `across ${plural(c, 'class', 'classes')}`,
		tower: (y: number) => `Line-up ${y}`,
		towerSub: 'Career wins',
		cols: { pos: 'Pos', driver: 'Driver', wins: 'Wins' },
		lightsIn: 'Lights out in',
		units: ['d', 'h', 'm', 's'],
		stats: { wins: 'Career wins', podiums: 'Podiums', poles: 'Pole positions', seasons: 'Seasons' },
		scroll: 'Scroll'
	},
	ticker: ['Kartódromo do Faial', 'Campeonato de Portugal de Karting', 'Madeira regional series', 'Rotax Max', 'X30', 'KZ2', 'From the Atlantic'],
	hall: {
		eyebrow: 'Hall of Fame',
		title: ['Hall of', 'Fame'],
		intro: 'Every season, every title and every driver who has raced in our colours.',
		seasons: 'Seasons',
		seasonsIntro: 'The years so far, newest first.',
		drivers: 'Former drivers',
		driversIntro: "They raced for K'ART. Most of them still race, now for other teams.",
		enter: 'Enter the Hall of Fame',
		totals: { seasons: 'Seasons', wins: 'Wins', podiums: 'Podiums', titles: 'Titles', alumni: 'Former drivers' },
		stats: { rounds: 'Rounds', wins: 'Wins', podiums: 'Podiums', poles: 'Poles' },
		titles: 'Titles and highlights',
		lineup: 'Line-up',
		years: (a: number, b: number) => (a === b ? String(a) : `${a} → ${b}`),
		withTeam: 'With the team',
		now: 'Now racing in',
		empty: 'The first chapter is still being written.',
		metaTitle: "Hall of Fame, K'ART Racing Team",
		metaDescription: "Every season, title and former driver of K'ART Racing Team, the karting team from Madeira."
	},
	team: {
		eyebrow: 'The team',
		statement: 'A new team from an island with a single kart track.',
		statementMuted: 'So we prepare harder, travel further and arrive at every round expecting to win.',
		wins: 'Race wins',
		winsNote: 'Career total across the line-up',
		podiums: 'Podiums',
		podiumsNote: (starts: number) => `From ${starts} starts between them`,
		poles: 'Pole positions',
		polesNote: 'Qualifying is where weekends are won',
		seasonPodiums: (y: number) => `${y} podiums`,
		seasonAll: 'A team driver on the podium at every round so far',
		seasonSome: 'Rounds with a team driver on the podium',
		pillars: [
			{
				title: 'Workshop',
				body: 'Chassis set-up, engine prep and data analysis all happen in-house, at our base at the Kartódromo do Faial. Nothing leaves the island until it is ready to win.'
			},
			{
				title: 'Logistics',
				body: 'Karts, tyres and tools cross the Atlantic by container for every mainland round. We plan weeks ahead so the drivers only have to think about lap time.'
			},
			{
				title: 'Academy',
				body: 'One ladder from Cadete to KZ2. Younger drivers share the awning with the older ones every weekend and learn what it takes, first hand.'
			}
		]
	},
	drivers: {
		eyebrow: (y: number) => `Drivers ${y}`,
		title: ['The', 'line-up'],
		intro: (n: number, c: number) =>
			`${cap(spellEn(n))} ${n === 1 ? 'driver' : 'drivers'} across ${spellEn(c)} ${c === 1 ? 'class' : 'classes'}. Open a driver for their kart, record and best result.`,
		starts: 'Starts',
		wins: 'Wins',
		podiums: 'Podiums',
		poles: 'Poles',
		open: (name: string, cat: string, n: number) => `${name}, ${cat}, number ${n}. View profile`,
		close: 'Close',
		best: 'Best result',
		age: 'Age',
		hometown: 'Hometown',
		since: 'Racing since',
		chassis: 'Chassis',
		engine: 'Engine',
		prev: 'Previous',
		next: 'Next'
	},
	season: {
		eyebrow: (y: number) => `Season ${y}`,
		title: ['Calendar', '& results'],
		soFar: (w: number, p: number, r: number) =>
			`So far: ${plural(w, 'win', 'wins')} and ${plural(p, 'podium', 'podiums')} from ${plural(r, 'round', 'rounds')}.`,
		notStarted: 'The season has not started yet.',
		next: (r: number, n: number) => `Next race, round ${r} of ${n}`,
		units: ['Days', 'Hours', 'Mins', 'Secs'],
		timer: 'Time until the next race',
		roundPrefix: 'R',
		roundSuffix: '',
		nextUp: 'Next up',
		pending: 'Result to follow',
		upcoming: 'Upcoming'
	},
	calendar: {
		label: 'Add the races to your calendar',
		short: 'Race calendar',
		apple: 'Apple / Outlook',
		google: 'Google',
		file: '.ics',
		fileTitle: 'Download the calendar file',
		description: "Race calendar of K'ART Racing Team, the karting team from Madeira.",
		event: (location: string, r: number) => `K'ART · ${location}, round ${r}`,
		results: 'Results'
	},
	news: {
		eyebrow: 'News',
		title: ['From the', 'paddock'],
		intro: 'Race reports, results and team news.',
		all: 'All news',
		read: 'Read the story',
		empty: 'No news yet. Check back after the next race.',
		draft: 'Preview. This post is a draft, so only people signed in to the admin can see it.',
		scheduled: (date: string) =>
			`Preview. This post appears on the site on ${date}. Until then, only people signed in to the admin can see it.`,
		edit: 'Edit in the admin'
	},
	madeira: {
		eyebrow: 'Home',
		title: ['Built on', 'an island'],
		intro: 'Madeira is a steep volcanic island in the middle of the Atlantic. Every mainland round means shipping the whole operation across the ocean, so nothing is left to chance.',
		map: 'Contour map of Madeira with Faial and Pico Ruivo marked',
		workshop: 'Kartódromo do Faial',
		track: {
			eyebrow: 'Home track',
			place: 'Faial, Santana, on the north coast of Madeira. Our base, where we test and set up the karts all year.',
			length: 'Lap length',
			direction: 'Direction',
			clockwise: 'Clockwise',
			anticlockwise: 'Anticlockwise',
			coords: 'Location',
			alt: 'Layout of the Kartódromo do Faial, drawn from map data'
		},
		peak: '1,862 m',
		route: 'To Lisbon, 1,000 km',
		facts: [
			{ v: '57', u: 'km', l: 'From one end of the island to the other.' },
			{ v: '1,862', u: 'm', l: 'Pico Ruivo, the highest point on the island.' },
			{ v: '~1,000', u: 'km', l: 'Of open ocean to Lisbon. Every kart we race makes the crossing.' },
			{ v: '12', u: 'months', l: 'Of mild Atlantic weather, so testing never stops for winter.' }
		]
	},
	partners: {
		eyebrow: 'Partnerships',
		title: ['Your name', 'on the kart'],
		positions: (n: number) =>
			`Four positions on every kart, and ${spellEn(n)} ${n === 1 ? 'kart' : 'karts'} on the grid every weekend.`,
		deck: 'Request the partner deck',
		subject: "Partnership, K'ART Racing Team",
		ours: 'Our partners'
	},
	contact: {
		eyebrow: 'Contact',
		title: ["Let's go", 'racing.'],
		drivers: 'Drivers',
		press: 'Partners and press',
		follow: 'Follow',
		instagram: (h: string) => `Instagram, @${h}`,
		direct: 'Or write to us',
		form: {
			name: 'Name',
			email: 'Email',
			topic: 'About',
			optional: 'Optional',
			topics: { drivers: 'Racing with us', partners: 'Partnerships', press: 'Press', other: 'Something else' },
			message: 'Message',
			/** Shown inside the empty fields */
			hints: { name: 'Your name', email: 'you@example.com', message: 'Tell us what you have in mind' },
			honeypot: 'Leave this empty',
			send: 'Send message',
			sending: 'Sending',
			received: 'Message received',
			thanks: (name: string) => `Thanks, ${name}.`,
			reply: (email: string) => `We'll reply to ${email} soon.`,
			another: 'Send another message'
		},
		errors: {
			name: 'Tell us your name.',
			email: 'Check your email address, we need it to reply.',
			short: 'Write a little more, at least a sentence.',
			long: 'That is too long. Keep it under 4000 characters.',
			bot: "We couldn't confirm you're not a robot. Try again, or email us at",
			busy: 'Too many messages from this connection. Try again later, or email us at',
			failed: "The message didn't go through. Try again, or email us at"
		}
	},
	footer: { top: 'Back to top', credit: 'Site by' }
};

export type Messages = typeof en;

const pt: Messages = {
	meta: {
		title: "K'ART Racing Team, karting da Madeira",
		description:
			"A K'ART Racing Team é uma equipa de karting da Madeira, Portugal, sediada no Kartódromo do Faial, a correr na ilha e no continente."
	},
	lang: { other: 'en', label: 'English', short: 'EN' },
	nav: {
		team: 'Equipa',
		drivers: 'Pilotos',
		season: 'Temporada',
		news: 'Notícias',
		hall: 'Hall of Fame',
		madeira: 'Madeira',
		partners: 'Parceiros',
		contact: 'Contacto',
		cta: 'Fale connosco',
		open: 'Abrir menu',
		close: 'Fechar menu',
		home: "K'ART Racing Team, voltar ao topo"
	},
	hero: {
		meet: 'Conheça os pilotos',
		lightsOut: 'Luzes apagadas',
		season: (y) => `Temporada ${y}`,
		next: 'Próxima prova',
		when: (days) => (days <= 0 ? 'Este fim de semana' : days === 1 ? 'Amanhã' : `Daqui a ${days} dias`),
		done: 'Temporada concluída',
		soFar: (y) => `${y} até agora`,
		tally: (w, p) => `${plural(w, 'vitória', 'vitórias')}, ${plural(p, 'pódio', 'pódios')}`,
		from: (r, n) => `em ${r} de ${plural(n, 'prova', 'provas')}`,
		lineUp: 'Plantel',
		drivers: (n) => plural(n, 'piloto', 'pilotos'),
		classes: (c) => `em ${plural(c, 'categoria', 'categorias')}`,
		tower: (y) => `Plantel ${y}`,
		towerSub: 'Vitórias na carreira',
		cols: { pos: 'Pos', driver: 'Piloto', wins: 'Vit' },
		lightsIn: 'Luzes apagam em',
		units: ['d', 'h', 'm', 's'],
		stats: { wins: 'Vitórias na carreira', podiums: 'Pódios', poles: 'Pole positions', seasons: 'Temporadas' },
		scroll: 'Deslizar'
	},
	ticker: ['Kartódromo do Faial', 'Campeonato de Portugal de Karting', 'Regional da Madeira', 'Rotax Max', 'X30', 'KZ2', 'Do Atlântico'],
	hall: {
		eyebrow: 'Hall of Fame',
		title: ['Hall of', 'Fame'],
		intro: 'Todas as temporadas, todos os títulos e todos os pilotos que já correram com as nossas cores.',
		seasons: 'Temporadas',
		seasonsIntro: 'Os anos até agora, do mais recente para o mais antigo.',
		drivers: 'Antigos pilotos',
		driversIntro: "Correram pela K'ART. A maioria continua a correr, agora noutras equipas.",
		enter: 'Ver o Hall of Fame',
		totals: { seasons: 'Temporadas', wins: 'Vitórias', podiums: 'Pódios', titles: 'Títulos', alumni: 'Antigos pilotos' },
		stats: { rounds: 'Provas', wins: 'Vitórias', podiums: 'Pódios', poles: 'Poles' },
		titles: 'Títulos e destaques',
		lineup: 'Plantel',
		years: (a, b) => (a === b ? String(a) : `${a} → ${b}`),
		withTeam: 'Com a equipa',
		now: 'Agora corre em',
		empty: 'O primeiro capítulo ainda está a ser escrito.',
		metaTitle: "Hall of Fame, K'ART Racing Team",
		metaDescription: "Todas as temporadas, títulos e antigos pilotos da K'ART Racing Team, a equipa de karting da Madeira."
	},
	team: {
		eyebrow: 'A equipa',
		statement: 'Uma equipa nova, de uma ilha com uma única pista de karting.',
		statementMuted: 'Por isso preparamo-nos mais, viajamos mais longe e chegamos a cada prova para ganhar.',
		wins: 'Vitórias',
		winsNote: 'Total de carreira de todo o plantel',
		podiums: 'Pódios',
		podiumsNote: (starts) => `Em ${starts} corridas no total`,
		poles: 'Pole positions',
		polesNote: 'É na qualificação que se ganham os fins de semana',
		seasonPodiums: (y) => `Pódios em ${y}`,
		seasonAll: 'Um piloto da equipa no pódio em todas as provas até agora',
		seasonSome: 'Provas com um piloto da equipa no pódio',
		pillars: [
			{
				title: 'Oficina',
				body: 'A afinação dos chassis, a preparação dos motores e a análise de dados são feitas internamente, na nossa base no Kartódromo do Faial. Nada sai da ilha sem estar pronto para ganhar.'
			},
			{
				title: 'Logística',
				body: 'Karts, pneus e ferramentas atravessam o Atlântico em contentor para cada prova no continente. Planeamos com semanas de antecedência para que os pilotos só tenham de pensar no tempo por volta.'
			},
			{
				title: 'Academia',
				body: 'Um percurso único, de Cadete a KZ2. Os mais novos partilham a tenda com os mais velhos em cada fim de semana e aprendem, na primeira pessoa, o que é preciso para ganhar.'
			}
		]
	},
	drivers: {
		eyebrow: (y) => `Pilotos ${y}`,
		title: ['O', 'plantel'],
		intro: (n, c) =>
			`${cap(spellPt(n))} ${n === 1 ? 'piloto' : 'pilotos'} em ${spellPt(c, true)} ${c === 1 ? 'categoria' : 'categorias'}. Abra o perfil de cada piloto para ver o kart, o palmarés e o melhor resultado.`,
		starts: 'Corridas',
		wins: 'Vitórias',
		podiums: 'Pódios',
		poles: 'Poles',
		open: (name, cat, n) => `${name}, ${cat}, número ${n}. Ver perfil`,
		close: 'Fechar',
		best: 'Melhor resultado',
		age: 'Idade',
		hometown: 'Naturalidade',
		since: 'Corre desde',
		chassis: 'Chassis',
		engine: 'Motor',
		prev: 'Anterior',
		next: 'Seguinte'
	},
	season: {
		eyebrow: (y) => `Temporada ${y}`,
		title: ['Calendário', 'e resultados'],
		soFar: (w, p, r) =>
			`Até agora: ${plural(w, 'vitória', 'vitórias')} e ${plural(p, 'pódio', 'pódios')} em ${plural(r, 'prova', 'provas')}.`,
		notStarted: 'A temporada ainda não começou.',
		next: (r, n) => `Próxima prova, ${r}.ª de ${n}`,
		units: ['Dias', 'Horas', 'Min', 'Seg'],
		timer: 'Tempo até à próxima prova',
		roundPrefix: '',
		roundSuffix: '.ª',
		nextUp: 'A seguir',
		pending: 'Resultado em breve',
		upcoming: 'Por disputar'
	},
	calendar: {
		label: 'Adicione as provas ao seu calendário',
		short: 'Calendário de provas',
		apple: 'Apple / Outlook',
		google: 'Google',
		file: '.ics',
		fileTitle: 'Descarregar o ficheiro do calendário',
		description: "Calendário de provas da K'ART Racing Team, a equipa de karting da Madeira.",
		event: (location, r) => `K'ART · ${location}, ${r}.ª prova`,
		results: 'Resultados'
	},
	news: {
		eyebrow: 'Notícias',
		title: ['Direto do', 'paddock'],
		intro: 'Crónicas de corrida, resultados e novidades da equipa.',
		all: 'Todas as notícias',
		read: 'Ler a notícia',
		empty: 'Ainda não há notícias. Volte depois da próxima prova.',
		draft: 'Pré-visualização. Esta notícia é um rascunho, por isso só é visível para quem tem sessão iniciada no admin.',
		scheduled: (date) =>
			`Pré-visualização. Esta notícia aparece no site a ${date}. Até lá, só é visível para quem tem sessão iniciada no admin.`,
		edit: 'Editar no admin'
	},
	madeira: {
		eyebrow: 'Casa',
		title: ['Feitos', 'numa ilha'],
		intro: 'A Madeira é uma ilha vulcânica e escarpada no meio do Atlântico. Cada prova no continente obriga a enviar toda a operação através do oceano, por isso nada fica ao acaso.',
		map: 'Mapa topográfico da Madeira com o Faial e o Pico Ruivo assinalados',
		workshop: 'Kartódromo do Faial',
		track: {
			eyebrow: 'A pista da casa',
			place: 'Faial, Santana, na costa norte da Madeira. A nossa base, onde treinamos e afinamos os karts durante todo o ano.',
			length: 'Perímetro',
			direction: 'Sentido',
			clockwise: 'Horário',
			anticlockwise: 'Anti-horário',
			coords: 'Localização',
			alt: 'Traçado do Kartódromo do Faial, desenhado a partir de dados cartográficos'
		},
		peak: '1862 m',
		route: 'Para Lisboa, 1000 km',
		facts: [
			{ v: '57', u: 'km', l: 'De uma ponta à outra da ilha.' },
			{ v: '1862', u: 'm', l: 'Pico Ruivo, o ponto mais alto da ilha.' },
			{ v: '~1000', u: 'km', l: 'De mar aberto até Lisboa. Todos os nossos karts fazem a travessia.' },
			{ v: '12', u: 'meses', l: 'De clima atlântico ameno, por isso os testes não param no inverno.' }
		]
	},
	partners: {
		eyebrow: 'Patrocínios',
		title: ['O seu nome', 'no kart'],
		positions: (n) =>
			`Quatro posições em cada kart, e ${spellPt(n)} ${n === 1 ? 'kart' : 'karts'} na grelha em cada fim de semana.`,
		deck: 'Pedir o dossiê de patrocínio',
		subject: "Patrocínio, K'ART Racing Team",
		ours: 'Os nossos parceiros'
	},
	contact: {
		eyebrow: 'Contacto',
		title: ['Vamos', 'correr.'],
		drivers: 'Pilotos',
		press: 'Parceiros e imprensa',
		follow: 'Siga-nos',
		instagram: (h) => `Instagram, @${h}`,
		direct: 'Ou escreva-nos',
		form: {
			name: 'Nome',
			email: 'Email',
			topic: 'Assunto',
			optional: 'Opcional',
			topics: { drivers: 'Correr connosco', partners: 'Parcerias', press: 'Imprensa', other: 'Outro assunto' },
			message: 'Mensagem',
			hints: { name: 'O seu nome', email: 'nome@exemplo.pt', message: 'Conte-nos o que tem em mente' },
			honeypot: 'Deixe em branco',
			send: 'Enviar mensagem',
			sending: 'A enviar',
			received: 'Mensagem recebida',
			thanks: (name) => `Obrigado, ${name}.`,
			reply: (email) => `Vamos responder para ${email} em breve.`,
			another: 'Enviar outra mensagem'
		},
		errors: {
			name: 'Indique o seu nome.',
			email: 'Confirme o seu email, precisamos dele para responder.',
			short: 'Escreva um pouco mais, pelo menos uma frase.',
			long: 'A mensagem é demasiado longa. Use menos de 4000 caracteres.',
			bot: 'Não conseguimos confirmar que não é um robô. Tente outra vez, ou escreva para',
			busy: 'Demasiadas mensagens a partir desta ligação. Tente mais tarde, ou escreva para',
			failed: 'A mensagem não seguiu. Tente outra vez, ou escreva para'
		}
	},
	footer: { top: 'Voltar ao topo', credit: 'Site por' }
};

export const messages: Record<Lang, Messages> = { pt, en };

// ---------- context ----------

export interface I18n {
	readonly lang: Lang;
	readonly t: Messages;
}

const KEY = Symbol('i18n');

export const setI18n = (getLang: () => Lang) =>
	setContext<I18n>(KEY, {
		get lang() {
			return getLang();
		},
		get t() {
			return messages[getLang()];
		}
	});

export const useI18n = () => getContext<I18n>(KEY);

// ---------- urls ----------

/** Prefixes a site path with /en for English. */
export const localize = (path: string, lang: Lang) => (lang === 'en' ? (path === '/' ? '/en' : `/en${path}`) : path);

/** The news section is /noticias in Portuguese and /en/news in English. */
export const newsPath = (lang: Lang, slug?: string) =>
	localize(`/${lang === 'pt' ? 'noticias' : 'news'}${slug ? `/${slug}` : ''}`, lang);

/** The Hall of Fame keeps its English name in both languages: /hall-of-fame and /en/hall-of-fame. */
export const hallPath = (lang: Lang) => localize('/hall-of-fame', lang);

/** The race calendar feed is /calendario.ics in Portuguese and /en/calendar.ics in English. */
export const calendarPath = (lang: Lang) => localize(lang === 'pt' ? '/calendario.ics' : '/calendar.ics', lang);

/**
 * Ways to add the race calendar: a webcal subscription for Apple Calendar and
 * Outlook, Google Calendar's subscribe page, and the file itself.
 */
export function calendarLinks(host: string, lang: Lang) {
	const webcal = `webcal://${host}${calendarPath(lang)}`;
	return { webcal, google: `https://www.google.com/calendar/render?cid=${webcal}`, file: calendarPath(lang) };
}

/** The same page in the other language: / and /en, /noticias/x and /en/news/x. */
export function alternatePath(pathname: string, to: Lang) {
	if (to === 'en') {
		if (pathname.startsWith('/en')) return pathname;
		if (pathname === '/') return '/en';
		return `/en${pathname.replace(/^\/noticias(?=\/|$)/, '/news')}`;
	}
	const rest = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
	return rest.replace(/^\/news(?=\/|$)/, '/noticias');
}

/** Section links for the nav and footer. On the home page they are plain anchors. */
export function siteLinks(t: Messages, lang: Lang, { home, news }: { home: boolean; news: boolean }) {
	const base = home ? '' : localize('/', lang);
	type Id = 'team' | 'drivers' | 'season' | 'hall' | 'news' | 'partners' | 'contact';
	const ids: Id[] = ['team', 'drivers', 'season', 'hall', ...(news ? ['news' as const] : []), 'partners', 'contact'];
	return ids.map((id) => ({
		id,
		label: t.nav[id],
		href: id === 'hall' ? hallPath(lang) : id === 'news' && !home ? newsPath(lang) : `${base}#${id}`
	}));
}
