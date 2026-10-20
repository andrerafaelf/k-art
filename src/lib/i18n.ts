import { getContext, setContext } from 'svelte';
import type { Lang } from '#lib/content.ts';
import { textIn, linesIn, type Texts, type StringKey, type LinesKey } from '#lib/texts.ts';

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
		shop: 'Shop',
		contact: 'Contact',
		cta: 'Get in touch',
		open: 'Open menu',
		close: 'Close menu',
		home: "K'ART Racing Team, home page"
	},
	hero: {
		meet: 'Meet the drivers',
		season: (y: number) => `${y} season`,
		lightsIn: 'Lights out in',
		round: (r: number, n: number) => `Round ${r} of ${n}`,
		units: ['d', 'h', 'm', 's']
	},
	ticker: ['Kartódromo do Faial', 'Campeonato de Portugal de Karting', 'Madeira regional series', 'Rotax Max', 'X30', 'KZ2', 'From the Atlantic'],
	hall: {
		seasons: 'Seasons',
		drivers: 'Former drivers',
		enter: 'Enter the Hall of Fame',
		totals: { seasons: 'Seasons', wins: 'Wins', podiums: 'Podiums', titles: 'Titles', alumni: 'Former drivers' },
		stats: { rounds: 'Rounds', wins: 'Wins', podiums: 'Podiums', poles: 'Poles' },
		titles: 'Titles and highlights',
		lineup: 'Drivers',
		years: (a: number, b: number) => (a === b ? String(a) : `${a} → ${b}`),
		withTeam: 'With the team',
		now: 'Now racing in',
		metaTitle: "Hall of Fame, K'ART Racing Team",
		metaDescription: "Every season, title and former driver of K'ART Racing Team, the karting team from Madeira."
	},
	team: {
		wins: (y: number) => `Wins in ${y}`,
		winsNote: (r: number, n: number) => `From ${r} of ${plural(n, 'round', 'rounds')} so far`,
		podiums: (y: number) => `Podiums in ${y}`,
		podiumsNote: 'Counting every driver in the team',
		drivers: 'Drivers',
		driversNote: (c: number) => `Across ${plural(c, 'class', 'classes')}`,
		more: 'Meet the team',
		metaTitle: "The team, K'ART Racing Team",
		metaDescription:
			'A new karting team based at the Kartódromo do Faial, on Madeira. The workshop, the logistics, the academy and the home track.',
		seasonPodiums: 'Rounds on the podium',
		seasonAll: 'A team driver on the podium at every round so far',
		seasonSome: 'Rounds with a team driver on the podium',
	},
	drivers: {
		/** The automatic first sentence of the drivers page introduction */
		count: (n: number, c: number) =>
			`${cap(spellEn(n))} ${n === 1 ? 'driver' : 'drivers'} across ${spellEn(c)} ${c === 1 ? 'class' : 'classes'}.`,
		open: (name: string, cat: string, n: number) => `${name}, ${cat}, number ${n}. View profile`,
		close: 'Close',
		country: 'Nationality',
		age: 'Age',
		hometown: 'Hometown',
		since: 'Racing since',
		chassis: 'Chassis',
		engine: 'Engine',
		prev: 'Previous',
		next: 'Next',
		all: 'See the profiles',
		metaTitle: (y: number) => `Drivers ${y}, K'ART Racing Team`,
		metaDescription: "The K'ART Racing Team drivers: classes, race numbers, nationalities and each driver's kart."
	},
	season: {
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
		upcoming: 'Upcoming',
		all: 'Full calendar',
		metaTitle: (y: number) => `Season ${y}, K'ART Racing Team`,
		metaDescription: "Race calendar and results of K'ART Racing Team, with a countdown to the next race."
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
		all: 'All news',
		read: 'Read the story',
		draft: 'Preview. This post is a draft, so only people signed in to the admin can see it.',
		scheduled: (date: string) =>
			`Preview. This post appears on the site on ${date}. Until then, only people signed in to the admin can see it.`,
		edit: 'Edit in the admin'
	},
	madeira: {
		map: 'Contour map of Madeira with Faial and Pico Ruivo marked',
		workshop: 'Kartódromo do Faial',
		track: {
			length: 'Lap length',
			direction: 'Direction',
			clockwise: 'Clockwise',
			anticlockwise: 'Anticlockwise',
			coords: 'Location',
			alt: 'Layout of the Kartódromo do Faial, drawn from map data'
		},
		peak: '1,862 m',
		route: 'To Lisbon, 1,000 km',
	},
	partners: {
		positions: (n: number) =>
			`Four positions on every kart, and ${spellEn(n)} ${n === 1 ? 'kart' : 'karts'} on the grid every weekend.`,
		deck: 'Request the partner deck',
		subject: "Partnership, K'ART Racing Team",
		ours: 'Our partners',
		more: 'See the positions on the kart',
		metaTitle: "Partnerships, K'ART Racing Team",
		metaDescription: "The four sponsorship positions on every K'ART Racing Team kart, and the partners already racing with us."
	},
	contact: {
		drivers: 'Drivers',
		press: 'Partners and press',
		follow: 'Follow',
		instagram: (h: string) => `Instagram, @${h}`,
		direct: 'Or write to us',
		metaTitle: "Contact, K'ART Racing Team",
		metaDescription: "Get in touch with K'ART Racing Team about racing with us, partnerships or press.",
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
	shop: {
		all: 'All',
		filters: 'Categories',
		search: 'Name, brand or part number',
		searchLabel: 'Search the shop',
		used: 'Used',
		new: 'New',
		usedOnly: 'Used only',
		count: (n: number) => plural(n, 'item', 'items'),
		noMatch: 'Nothing matches that search.',
		clear: 'Show everything',
		onRequest: 'Price on request',
		from: (price: string) => `From ${price}`,
		was: (price: string) => `Was ${price}`,
		vat: 'VAT included',
		stock: {
			in: (n: number) => `${n} in stock`,
			low: (n: number) => (n === 1 ? 'Last one in stock' : `Last ${n} in stock`),
			out: 'Sold out',
			order: 'Out of stock, we can order it in'
		},
		condition: 'Condition',
		brand: 'Brand',
		ref: 'Part number',
		fits: 'Fits',
		category: 'Category',
		pick: (what: string) => `Choose: ${what.toLowerCase()}`,
		pickFirst: 'Choose an option first',
		soldOut: (label: string) => `${label}, sold out`,
		qty: 'Quantity',
		less: 'One fewer',
		more: 'One more',
		add: 'Add to list',
		addOne: (name: string) => `Add ${name} to your list`,
		added: 'Added to your list',
		onList: (n: number) => `${n} on your list`,
		chooseSize: 'Choose',
		photo: (n: number, total: number) => `Photo ${n} of ${total}`,
		back: 'Back to the shop',
		bar: (n: number) => `Your list, ${plural(n, 'item', 'items')}`,
		view: 'View list',
		list: {
			empty: 'Your list is empty.',
			unknown: 'An item no longer in the shop',
			emptyMore: 'Add parts from the shop and they appear here, ready to send to the team.',
			browse: 'Browse the shop',
			item: 'Item',
			each: 'Each',
			total: 'Total',
			estimate: 'Estimated total',
			plusRequest: (n: number) => `Plus ${plural(n, 'item', 'items')} priced on request`,
			remove: (name: string) => `Remove ${name}`,
			clear: 'Clear the list',
			clearConfirm: 'Remove everything from your list?',
			problems: {
				gone: 'No longer for sale. Remove it from the list.',
				size: 'This option is no longer available. Choose another one.',
				out: 'Sold out since you added it.',
				less: (n: number) => (n === 1 ? 'Only one left, so the quantity went down.' : `Only ${n} left, so the quantity went down.`)
			},
			ways: 'Send the list',
			pdf: 'Download as PDF',
			whatsapp: 'Send on WhatsApp',
			email: 'Send to the team',
			emailNote: 'We reply by email'
		},
		form: {
			name: 'Name',
			email: 'Email',
			phone: 'Phone',
			message: 'Message',
			optional: 'Optional',
			hints: {
				name: 'Your name',
				email: 'you@example.com',
				phone: 'If you prefer a call',
				message: 'Anything we should know, like your kart or when you can collect'
			},
			send: 'Send the list',
			sending: 'Sending',
			received: 'List received',
			thanks: (name: string, n: number) => `Thanks, ${name}. That is request no. ${n}.`,
			reply: (email: string) => `We'll reply to ${email} with availability, payment and pickup.`,
			pdf: 'Download a copy as PDF',
			again: 'Back to the shop'
		},
		errors: {
			phone: 'Check the phone number, or leave it empty.',
			long: 'That is too long. Keep it under 2000 characters.',
			empty: 'Your list has nothing that can be ordered yet.',
			changed: 'Some items changed while you were here. Check the list and send it again.'
		},
		whatsapp: {
			hello: "Hello! I'd like these from the K'ART shop:",
			request: 'price on request',
			total: (price: string) => `Estimated total: ${price}`,
			thanks: 'Thanks!'
		},
		pdf: {
			title: 'Shopping list',
			request: (n: number) => `Request no. ${n}`,
			qty: 'Qty',
			item: 'Item',
			each: 'Each',
			total: 'Total',
			ref: (r: string) => `Ref. ${r}`,
			page: (n: number, total: number) => `Page ${n} of ${total}`,
			file: 'kart-shopping-list'
		},
		preview: 'Preview. The shop is switched off, so only people signed in to the admin can see it.',
		hidden: 'Preview. This product is hidden, so only people signed in to the admin can see it.',
		edit: 'Edit in the admin',
		metaTitle: "Shop, K'ART Racing Team",
		metaDescription: "Karting parts, tyres and kit from K'ART Racing Team, new and used, collected at the Kartódromo do Faial in Madeira.",
		listTitle: "Your list, K'ART Racing Team"
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
		shop: 'Loja',
		contact: 'Contacto',
		cta: 'Fale connosco',
		open: 'Abrir menu',
		close: 'Fechar menu',
		home: "K'ART Racing Team, página inicial"
	},
	hero: {
		meet: 'Conheça os pilotos',
		season: (y) => `Temporada ${y}`,
		lightsIn: 'Luzes apagam em',
		round: (r, n) => `${r}.ª prova de ${n}`,
		units: ['d', 'h', 'm', 's']
	},
	ticker: ['Kartódromo do Faial', 'Campeonato de Portugal de Karting', 'Regional da Madeira', 'Rotax Max', 'X30', 'KZ2', 'Do Atlântico'],
	hall: {
		seasons: 'Temporadas',
		drivers: 'Antigos pilotos',
		enter: 'Ver o Hall of Fame',
		totals: { seasons: 'Temporadas', wins: 'Vitórias', podiums: 'Pódios', titles: 'Títulos', alumni: 'Antigos pilotos' },
		stats: { rounds: 'Provas', wins: 'Vitórias', podiums: 'Pódios', poles: 'Poles' },
		titles: 'Títulos e destaques',
		lineup: 'Pilotos',
		years: (a, b) => (a === b ? String(a) : `${a} → ${b}`),
		withTeam: 'Com a equipa',
		now: 'Agora corre em',
		metaTitle: "Hall of Fame, K'ART Racing Team",
		metaDescription: "Todas as temporadas, títulos e antigos pilotos da K'ART Racing Team, a equipa de karting da Madeira."
	},
	team: {
		wins: (y) => `Vitórias em ${y}`,
		winsNote: (r, n) => `Em ${r} de ${plural(n, 'prova', 'provas')} até agora`,
		podiums: (y) => `Pódios em ${y}`,
		podiumsNote: 'Contando todos os pilotos da equipa',
		drivers: 'Pilotos',
		driversNote: (c) => `Em ${plural(c, 'categoria', 'categorias')}`,
		more: 'Conheça a equipa',
		metaTitle: "A equipa, K'ART Racing Team",
		metaDescription:
			'Uma equipa de karting nova, sediada no Kartódromo do Faial, na Madeira. A oficina, a logística, a academia e a pista da casa.',
		seasonPodiums: 'Provas com pódio',
		seasonAll: 'Um piloto da equipa no pódio em todas as provas até agora',
		seasonSome: 'Provas com um piloto da equipa no pódio',
	},
	drivers: {
		count: (n, c) =>
			`${cap(spellPt(n))} ${n === 1 ? 'piloto' : 'pilotos'} em ${spellPt(c, true)} ${c === 1 ? 'categoria' : 'categorias'}.`,
		open: (name, cat, n) => `${name}, ${cat}, número ${n}. Ver perfil`,
		close: 'Fechar',
		country: 'Nacionalidade',
		age: 'Idade',
		hometown: 'Naturalidade',
		since: 'Corre desde',
		chassis: 'Chassis',
		engine: 'Motor',
		prev: 'Anterior',
		next: 'Seguinte',
		all: 'Ver os perfis',
		metaTitle: (y) => `Pilotos ${y}, K'ART Racing Team`,
		metaDescription: "Os pilotos da K'ART Racing Team: categorias, números, nacionalidades e o kart de cada piloto."
	},
	season: {
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
		upcoming: 'Por disputar',
		all: 'Calendário completo',
		metaTitle: (y) => `Temporada ${y}, K'ART Racing Team`,
		metaDescription: "Calendário de provas e resultados da K'ART Racing Team, com contagem decrescente para a próxima corrida."
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
		all: 'Todas as notícias',
		read: 'Ler a notícia',
		draft: 'Pré-visualização. Esta notícia é um rascunho, por isso só é visível para quem tem sessão iniciada no admin.',
		scheduled: (date) =>
			`Pré-visualização. Esta notícia aparece no site a ${date}. Até lá, só é visível para quem tem sessão iniciada no admin.`,
		edit: 'Editar no admin'
	},
	madeira: {
		map: 'Mapa topográfico da Madeira com o Faial e o Pico Ruivo assinalados',
		workshop: 'Kartódromo do Faial',
		track: {
			length: 'Perímetro',
			direction: 'Sentido',
			clockwise: 'Horário',
			anticlockwise: 'Anti-horário',
			coords: 'Localização',
			alt: 'Traçado do Kartódromo do Faial, desenhado a partir de dados cartográficos'
		},
		peak: '1862 m',
		route: 'Para Lisboa, 1000 km',
	},
	partners: {
		positions: (n) =>
			`Quatro posições em cada kart, e ${spellPt(n)} ${n === 1 ? 'kart' : 'karts'} na grelha em cada fim de semana.`,
		deck: 'Pedir o dossiê de patrocínio',
		subject: "Patrocínio, K'ART Racing Team",
		ours: 'Os nossos parceiros',
		more: 'Ver as posições no kart',
		metaTitle: "Patrocínios, K'ART Racing Team",
		metaDescription: "As quatro posições de patrocínio em cada kart da K'ART Racing Team e os parceiros que já correm connosco."
	},
	contact: {
		drivers: 'Pilotos',
		press: 'Parceiros e imprensa',
		follow: 'Siga-nos',
		instagram: (h) => `Instagram, @${h}`,
		direct: 'Ou escreva-nos',
		metaTitle: "Contacto, K'ART Racing Team",
		metaDescription: "Fale com a K'ART Racing Team sobre correr connosco, patrocínios ou imprensa.",
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
	shop: {
		all: 'Tudo',
		filters: 'Categorias',
		search: 'Nome, marca ou referência',
		searchLabel: 'Procurar na loja',
		used: 'Usado',
		new: 'Novo',
		usedOnly: 'Só usados',
		count: (n) => plural(n, 'artigo', 'artigos'),
		noMatch: 'Nada corresponde a essa pesquisa.',
		clear: 'Ver tudo',
		onRequest: 'Preço sob consulta',
		from: (price) => `Desde ${price}`,
		was: (price) => `Antes ${price}`,
		vat: 'IVA incluído',
		stock: {
			in: (n) => `${n} em stock`,
			low: (n) => (n === 1 ? 'Última unidade' : `Últimas ${n} unidades`),
			out: 'Esgotado',
			order: 'Esgotado, podemos encomendar'
		},
		condition: 'Estado',
		brand: 'Marca',
		ref: 'Referência',
		fits: 'Compatível com',
		category: 'Categoria',
		pick: (what) => `Escolha: ${what.toLowerCase()}`,
		pickFirst: 'Escolha primeiro uma opção',
		soldOut: (label) => `${label}, esgotado`,
		qty: 'Quantidade',
		less: 'Menos um',
		more: 'Mais um',
		add: 'Adicionar à lista',
		addOne: (name) => `Adicionar ${name} à lista`,
		added: 'Adicionado à sua lista',
		onList: (n) => `${n} na sua lista`,
		chooseSize: 'Escolher',
		photo: (n, total) => `Fotografia ${n} de ${total}`,
		back: 'Voltar à loja',
		bar: (n) => `A sua lista, ${plural(n, 'artigo', 'artigos')}`,
		view: 'Ver lista',
		list: {
			empty: 'A sua lista está vazia.',
			unknown: 'Um artigo que já não está na loja',
			emptyMore: 'Adicione peças da loja e elas aparecem aqui, prontas a enviar à equipa.',
			browse: 'Ver a loja',
			item: 'Artigo',
			each: 'Unidade',
			total: 'Total',
			estimate: 'Total estimado',
			plusRequest: (n) => `Mais ${plural(n, 'artigo', 'artigos')} com preço sob consulta`,
			remove: (name) => `Remover ${name}`,
			clear: 'Limpar a lista',
			clearConfirm: 'Remover tudo da sua lista?',
			problems: {
				gone: 'Já não está à venda. Remova-o da lista.',
				size: 'Esta opção já não está disponível. Escolha outra.',
				out: 'Esgotou depois de o adicionar.',
				less: (n) => (n === 1 ? 'Só resta uma unidade, por isso a quantidade baixou.' : `Só restam ${n}, por isso a quantidade baixou.`)
			},
			ways: 'Enviar a lista',
			pdf: 'Descarregar em PDF',
			whatsapp: 'Enviar por WhatsApp',
			email: 'Enviar à equipa',
			emailNote: 'Respondemos por email'
		},
		form: {
			name: 'Nome',
			email: 'Email',
			phone: 'Telefone',
			message: 'Mensagem',
			optional: 'Opcional',
			hints: {
				name: 'O seu nome',
				email: 'nome@exemplo.pt',
				phone: 'Se preferir que lhe liguemos',
				message: 'Algo que devamos saber, como o seu kart ou quando pode levantar'
			},
			send: 'Enviar a lista',
			sending: 'A enviar',
			received: 'Lista recebida',
			thanks: (name, n) => `Obrigado, ${name}. É o pedido n.º ${n}.`,
			reply: (email) => `Vamos responder para ${email} com a disponibilidade, o pagamento e o levantamento.`,
			pdf: 'Descarregar uma cópia em PDF',
			again: 'Voltar à loja'
		},
		errors: {
			phone: 'Confirme o número de telefone, ou deixe-o em branco.',
			long: 'A mensagem é demasiado longa. Use menos de 2000 caracteres.',
			empty: 'A sua lista ainda não tem nada que se possa encomendar.',
			changed: 'Alguns artigos mudaram entretanto. Reveja a lista e envie de novo.'
		},
		whatsapp: {
			hello: "Olá! Gostava destes artigos da loja K'ART:",
			request: 'preço sob consulta',
			total: (price) => `Total estimado: ${price}`,
			thanks: 'Obrigado!'
		},
		pdf: {
			title: 'Lista de compras',
			request: (n) => `Pedido n.º ${n}`,
			qty: 'Qtd.',
			item: 'Artigo',
			each: 'Unidade',
			total: 'Total',
			ref: (r) => `Ref. ${r}`,
			page: (n, total) => `Página ${n} de ${total}`,
			file: 'kart-lista-de-compras'
		},
		preview: 'Pré-visualização. A loja está desligada, por isso só é visível para quem tem sessão iniciada no admin.',
		hidden: 'Pré-visualização. Este artigo está oculto, por isso só é visível para quem tem sessão iniciada no admin.',
		edit: 'Editar no admin',
		metaTitle: "Loja, K'ART Racing Team",
		metaDescription: "Peças, pneus e equipamento de karting da K'ART Racing Team, novos e usados, para levantar no Kartódromo do Faial, na Madeira.",
		listTitle: "A sua lista, K'ART Racing Team"
	},
	footer: { top: 'Voltar ao topo', credit: 'Site por' }
};

export const messages: Record<Lang, Messages> = { pt, en };

// ---------- context ----------

export interface I18n {
	readonly lang: Lang;
	/** Interface text: menus, buttons, labels */
	readonly t: Messages;
	/** A text written in the admin's Site texts (lib/texts.ts) */
	text(key: StringKey): string;
	/** A title from the Site texts, one entry per line */
	lines(key: LinesKey): string[];
}

const KEY = Symbol('i18n');

export const setI18n = (getLang: () => Lang, getTexts: () => Texts) =>
	setContext<I18n>(KEY, {
		get lang() {
			return getLang();
		},
		get t() {
			return messages[getLang()];
		},
		text: (key) => textIn(getTexts(), key, getLang()),
		lines: (key) => linesIn(getTexts(), key, getLang())
	});

export const useI18n = () => getContext<I18n>(KEY);

// ---------- urls ----------

/** Prefixes a site path with /en for English. */
export const localize = (path: string, lang: Lang) => (lang === 'en' ? (path === '/' ? '/en' : `/en${path}`) : path);

/**
 * The pages of the site and their address in each language: /pilotos in
 * Portuguese is /en/drivers in English. The Hall of Fame keeps its English name
 * in both. Each one is matched by a param matcher of the same name (params.ts).
 */
export const PAGES = {
	team: { pt: 'equipa', en: 'team' },
	drivers: { pt: 'pilotos', en: 'drivers' },
	season: { pt: 'temporada', en: 'season' },
	news: { pt: 'noticias', en: 'news' },
	hall: { pt: 'hall-of-fame', en: 'hall-of-fame' },
	partners: { pt: 'parceiros', en: 'partners' },
	shop: { pt: 'loja', en: 'shop' },
	contact: { pt: 'contacto', en: 'contact' }
} as const;

export type PageId = keyof typeof PAGES;
const PAGE_IDS = Object.keys(PAGES) as PageId[];

export const pagePath = (id: PageId, lang: Lang) => localize(`/${PAGES[id][lang]}`, lang);

export const newsPath = (lang: Lang, slug?: string) => pagePath('news', lang) + (slug ? `/${slug}` : '');

export const hallPath = (lang: Lang) => pagePath('hall', lang);

/** The visitor's list inside the shop: /loja/lista and /en/shop/list */
export const LIST = { pt: 'lista', en: 'list' } as const;

/** The shop, or a product in it: /loja/pneus-mg-red, /en/shop/pneus-mg-red */
export const shopPath = (lang: Lang, slug?: string) => pagePath('shop', lang) + (slug ? `/${slug}` : '');

export const listPath = (lang: Lang) => shopPath(lang, LIST[lang]);

/** The list as a PDF: /loja/lista.pdf and /en/shop/list.pdf */
export const listPdfPath = (lang: Lang) => shopPath(lang, `${LIST[lang]}.pdf`);

const langOf = (pathname: string): Lang => (/^\/en(\/|$)/.test(pathname) ? 'en' : 'pt');
const segments = (pathname: string) => pathname.replace(/^\/en(?=\/|$)/, '').split('/').filter(Boolean);

/** Which page a path belongs to: /noticias/some-post is in news. Undefined on the home page. */
export function pageOf(pathname: string): PageId | undefined {
	const lang = langOf(pathname);
	const [first] = segments(pathname);
	return PAGE_IDS.find((id) => PAGES[id][lang] === first);
}

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

/** The same page in the other language: / and /en, /pilotos and /en/drivers, /noticias/x and /en/news/x. */
export function alternatePath(pathname: string, to: Lang) {
	const id = pageOf(pathname);
	const [first, ...rest] = segments(pathname);
	if (!first) return localize('/', to);
	// The list keeps its place in the shop: /loja/lista is /en/shop/list
	const from = langOf(pathname);
	if (id === 'shop' && rest[0]?.replace(/\.pdf$/, '') === LIST[from]) rest[0] = rest[0].replace(LIST[from], LIST[to]);
	return localize(`/${[id ? PAGES[id][to] : first, ...rest].join('/')}`, to);
}

/** Links to the pages, for the header and footer. Pages with nothing on them yet are left out. */
export function siteLinks(t: Messages, lang: Lang, has: { drivers: boolean; season: boolean; news: boolean; shop: boolean }) {
	const ids = PAGE_IDS.filter((id) => (id === 'drivers' || id === 'season' || id === 'news' || id === 'shop' ? has[id] : true));
	return ids.map((id) => ({ id, label: t.nav[id], href: pagePath(id, lang) }));
}
