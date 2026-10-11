import { tr, type L, type Lang } from './content.ts';

// Every piece of writing on the site that the admin can change, grouped by the
// page it appears on, with its label in the admin, its limits and the text the
// site starts with. The site reads them with useI18n().text and .lines; the
// admin builds its "Site texts" forms from this list. Numbers, dates and counts
// stay automatic, and so do menus, buttons and form labels (lib/i18n.ts).

/** A single line, a paragraph, or a title written one line per row */
export type TextKind = 'line' | 'text' | 'lines';

interface Field<K extends string = string, T extends TextKind = TextKind> {
	key: K;
	kind: T;
	label: L;
	hint?: L;
	/** Longest it can be: characters, or characters per line for titles */
	max: number;
	/** Titles only: how many lines */
	maxLines?: number;
	/** Fields that belong together, such as one of the three pillars, share a set */
	set?: L;
	/** The part of the page it is on, shown as its own box in the admin */
	part?: L;
	start: T extends 'lines' ? L<string[]> : L;
}

const same = (s: string): L => ({ pt: s, en: s });

// Labels used by many fields
const EYEBROW: L = { pt: 'Linha pequena por cima do título', en: 'Small line above the title' };
const TITLE: L = { pt: 'Título', en: 'Title' };
const TITLE_HINT: L = {
	pt: 'Uma linha do título por linha. A última aparece no azul da equipa.',
	en: 'One line of the title per row. The last one is set in the team blue.'
};
const INTRO: L = { pt: 'Introdução', en: 'Introduction' };
const EMPTY: L = { pt: 'Texto quando ainda não há nada para mostrar', en: 'Text while there is nothing to show yet' };
const WITH_YEAR: L = {
	pt: 'O ano da temporada aparece a seguir, automaticamente.',
	en: 'The season year follows it automatically.'
};
const NAME: L = { pt: 'Nome', en: 'Name' };
const BODY: L = { pt: 'Texto', en: 'Text' };

const line = <K extends string>(key: K, label: L, start: L, more: Partial<Field> = {}) =>
	({ key, kind: 'line', label, start, max: 80, ...more }) as Field<K, 'line'>;
const text = <K extends string>(key: K, label: L, start: L, more: Partial<Field> = {}) =>
	({ key, kind: 'text', label, start, max: 400, ...more }) as Field<K, 'text'>;
const title = <K extends string>(key: K, start: L<string[]>, more: Partial<Field> = {}) =>
	({ key, kind: 'lines', label: TITLE, hint: TITLE_HINT, start, max: 20, maxLines: 3, ...more }) as Field<K, 'lines'>;

/** Puts fields in a part of the page, shown as a box of its own in the admin */
const part = <F extends readonly Field[]>(label: L, fields: F) =>
	fields.map((f) => ({ ...f, part: label })) as unknown as F;

const pillar = <N extends 1 | 2 | 3>(n: N, name: L, body: L) => {
	const set = { pt: `Bloco ${n}`, en: `Block ${n}` };
	return [
		line(`team.pillar${n}.title`, NAME, name, { set, max: 24 }),
		text(`team.pillar${n}.body`, BODY, body, { set, max: 260 })
	] as const;
};

const fact = <N extends 1 | 2 | 3 | 4>(n: N, value: L, unit: L, body: L) => {
	const set = { pt: `Número ${n}`, en: `Figure ${n}` };
	return [
		line(`team.fact${n}.value`, { pt: 'Número', en: 'Figure' }, value, { set, max: 8 }),
		line(`team.fact${n}.unit`, { pt: 'Unidade', en: 'Unit' }, unit, { set, max: 8 }),
		text(`team.fact${n}.body`, { pt: 'Explicação', en: 'Explanation' }, body, { set, max: 120 })
	] as const;
};

const position = <Z extends 'pods' | 'nassau' | 'nose' | 'bumper'>(zone: Z, n: number, name: L, tier: L, body: L) => {
	const set = { pt: `Posição ${n} no kart`, en: `Position ${n} on the kart` };
	return [
		line(`partners.${zone}.title`, NAME, name, { set, max: 30 }),
		line(`partners.${zone}.tier`, { pt: 'Nível', en: 'Tier' }, tier, { set, max: 30 }),
		text(`partners.${zone}.body`, BODY, body, { set, max: 200 })
	] as const;
};

export const GROUPS = [
	{
		id: 'home',
		label: { pt: 'Página inicial', en: 'Home page' },
		desc: {
			pt: 'O título grande e a introdução no topo da página inicial. As outras secções da página inicial usam os títulos de cada página.',
			en: 'The big title and introduction at the top of the home page. The other sections on the home page use the titles of each page.'
		},
		path: { pt: '/', en: '/en' },
		fields: [
			line('home.eyebrow', EYEBROW, { pt: 'Equipa de karting, Madeira, Portugal', en: 'Karting team, Madeira, Portugal' }, { max: 60 }),
			title(
				'home.title',
				{ pt: ['Do Atlântico', 'para o', 'pódio.'], en: ['From the', 'Atlantic', 'to the', 'front row.'] },
				{ max: 16, maxLines: 5 }
			),
			text(
				'home.lead',
				INTRO,
				{
					pt: "A K'ART Racing Team é uma nova equipa de karting da Madeira, sediada no Kartódromo do Faial. Seis pilotos e um só objetivo em cada fim de semana de corrida: o lugar mais alto do pódio.",
					en: "K'ART Racing Team is a new karting team from Madeira, based at the Kartódromo do Faial. Six drivers and one goal every race weekend: the top step."
				},
				{ max: 260 }
			)
		]
	},
	{
		id: 'team',
		label: { pt: 'Equipa', en: 'Team' },
		desc: {
			pt: 'A apresentação da equipa, os três blocos sobre como trabalhamos, e a Madeira. A frase da equipa também aparece na página inicial.',
			en: 'The team introduction, the three blocks on how we work, and Madeira. The team statement also appears on the home page.'
		},
		path: { pt: '/equipa', en: '/en/team' },
		fields: [
			...part({ pt: 'Apresentação', en: 'Introduction' }, [
				line('team.eyebrow', EYEBROW, { pt: 'A equipa', en: 'The team' }, { max: 40 }),
				title('team.title', { pt: ['Uma equipa', 'da Madeira'], en: ['A team', 'from Madeira'] }),
				text(
					'team.statement',
					{ pt: 'Frase da equipa', en: 'Team statement' },
					{
						pt: 'Uma equipa nova, de uma ilha com uma única pista de karting.',
						en: 'A new team from an island with a single kart track.'
					},
					{ max: 140 }
				),
				text(
					'team.statementMore',
					{ pt: 'Continuação da frase', en: 'Rest of the statement' },
					{
						pt: 'Por isso preparamo-nos mais, viajamos mais longe e chegamos a cada prova para ganhar.',
						en: 'So we prepare harder, travel further and arrive at every round expecting to win.'
					},
					{
						max: 200,
						hint: {
							pt: 'Na página inicial aparece a cinzento, logo a seguir à frase.',
							en: 'On the home page it is set in grey, straight after the statement.'
						}
					}
				),
			] as const),
			...part({ pt: 'Como trabalhamos', en: 'How we work' }, [
				...pillar(1, { pt: 'Oficina', en: 'Workshop' }, {
					pt: 'A afinação dos chassis, a preparação dos motores e a análise de dados são feitas internamente, na nossa base no Kartódromo do Faial. Nada sai da ilha sem estar pronto para ganhar.',
					en: 'Chassis set-up, engine prep and data analysis all happen in-house, at our base at the Kartódromo do Faial. Nothing leaves the island until it is ready to win.'
				}),
				...pillar(2, { pt: 'Logística', en: 'Logistics' }, {
					pt: 'Karts, pneus e ferramentas atravessam o Atlântico em contentor para cada prova no continente. Planeamos com semanas de antecedência para que os pilotos só tenham de pensar no tempo por volta.',
					en: 'Karts, tyres and tools cross the Atlantic by container for every mainland round. We plan weeks ahead so the drivers only have to think about lap time.'
				}),
				...pillar(3, { pt: 'Academia', en: 'Academy' }, {
					pt: 'Um percurso único, de Cadete a KZ2. Os mais novos partilham a tenda com os mais velhos em cada fim de semana e aprendem, na primeira pessoa, o que é preciso para ganhar.',
					en: 'One ladder from Cadete to KZ2. Younger drivers share the awning with the older ones every weekend and learn what it takes, first hand.'
				}),
			] as const),
			...part(same('Madeira'), [
				line('team.madeira.eyebrow', EYEBROW, { pt: 'Casa', en: 'Home' }, { max: 40 }),
				title('team.madeira.title', { pt: ['Feitos', 'numa ilha'], en: ['Built on', 'an island'] }),
				text(
					'team.madeira.intro',
					INTRO,
					{
						pt: 'A Madeira é uma ilha vulcânica e escarpada no meio do Atlântico. Cada prova no continente obriga a enviar toda a operação através do oceano, por isso nada fica ao acaso.',
						en: 'Madeira is a steep volcanic island in the middle of the Atlantic. Every mainland round means shipping the whole operation across the ocean, so nothing is left to chance.'
					},
					{ max: 300 }
				),
				...fact(1, same('57'), same('km'), { pt: 'De uma ponta à outra da ilha.', en: 'From one end of the island to the other.' }),
				...fact(2, { pt: '1862', en: '1,862' }, same('m'), { pt: 'Pico Ruivo, o ponto mais alto da ilha.', en: 'Pico Ruivo, the highest point on the island.' }),
				...fact(3, { pt: '~1000', en: '~1,000' }, same('km'), {
					pt: 'De mar aberto até Lisboa. Todos os nossos karts fazem a travessia.',
					en: 'Of open ocean to Lisbon. Every kart we race makes the crossing.'
				}),
				...fact(4, same('12'), { pt: 'meses', en: 'months' }, {
					pt: 'De clima atlântico ameno, por isso os testes não param no inverno.',
					en: 'Of mild Atlantic weather, so testing never stops for winter.'
				}),
			] as const),
			...part({ pt: 'Pista da casa', en: 'Home track' }, [
				line('team.track.eyebrow', { pt: 'Linha pequena por cima do mapa', en: 'Small line above the map' }, { pt: 'A pista da casa', en: 'Home track' }, { max: 40 }),
				text(
					'team.track.place',
					BODY,
					{
						pt: 'Faial, Santana, na costa norte da Madeira. A nossa base, onde treinamos e afinamos os karts durante todo o ano.',
						en: 'Faial, Santana, on the north coast of Madeira. Our base, where we test and set up the karts all year.'
					},
					{ max: 200 }
				)
			] as const)
		]
	},
	{
		id: 'drivers',
		label: { pt: 'Pilotos', en: 'Drivers' },
		desc: {
			pt: 'O título da página dos pilotos, também usado na página inicial.',
			en: 'The title of the drivers page, also used on the home page.'
		},
		path: { pt: '/pilotos', en: '/en/drivers' },
		fields: [
			line('drivers.eyebrow', EYEBROW, { pt: 'Na pista em', en: 'On track in' }, { max: 40, hint: WITH_YEAR }),
			title('drivers.title', { pt: ['Os', 'pilotos'], en: ['The', 'drivers'] }),
			text(
				'drivers.intro',
				INTRO,
				{
					pt: 'Abra o perfil de cada piloto para ver de onde vem e com que kart corre.',
					en: 'Open a driver to see where they come from and what they race.'
				},
				{
					max: 200,
					hint: {
						pt: 'Vem depois da contagem automática, por exemplo "Sete pilotos em cinco categorias."',
						en: 'Follows the automatic count, for example "Seven drivers across five classes."'
					}
				}
			),
			text('drivers.empty', EMPTY, {
				pt: 'Os pilotos da nova temporada são anunciados em breve.',
				en: 'The drivers for the new season are announced soon.'
			}, { max: 160 })
		]
	},
	{
		id: 'season',
		label: { pt: 'Temporada', en: 'Season' },
		desc: {
			pt: 'O título e a introdução do calendário, também usados na página inicial.',
			en: 'The title and introduction of the calendar, also used on the home page.'
		},
		path: { pt: '/temporada', en: '/en/season' },
		fields: [
			line('season.eyebrow', EYEBROW, { pt: 'Temporada', en: 'Season' }, { max: 40, hint: WITH_YEAR }),
			title('season.title', { pt: ['Calendário', 'e resultados'], en: ['Calendar', '& results'] }),
			text(
				'season.intro',
				INTRO,
				{
					pt: 'Provas do Campeonato de Portugal de Karting e do Regional da Madeira.',
					en: 'Rounds across the Portuguese championship and the Madeira regional series.'
				},
				{
					max: 200,
					hint: { pt: 'As vitórias e os pódios até agora são acrescentados a seguir, automaticamente.', en: 'The wins and podiums so far follow automatically.' }
				}
			),
			text('season.empty', EMPTY, {
				pt: 'O calendário da nova temporada é anunciado em breve.',
				en: 'The calendar for the new season is announced soon.'
			}, { max: 160 })
		]
	},
	{
		id: 'hall',
		label: same('Hall of Fame'),
		desc: { pt: 'Os textos da página do Hall of Fame.', en: 'The texts on the Hall of Fame page.' },
		path: { pt: '/hall-of-fame', en: '/en/hall-of-fame' },
		fields: [
			line('hall.eyebrow', EYEBROW, same('Hall of Fame'), { max: 40 }),
			title('hall.title', { pt: ['Hall of', 'Fame'], en: ['Hall of', 'Fame'] }),
			text('hall.intro', INTRO, {
				pt: 'Todas as temporadas, todos os títulos e todos os pilotos que já correram com as nossas cores.',
				en: 'Every season, every title and every driver who has raced in our colours.'
			}, { max: 200 }),
			text('hall.seasons', { pt: 'Texto sobre as temporadas', en: 'Text about the seasons' }, {
				pt: 'Os anos até agora, do mais recente para o mais antigo.',
				en: 'The years so far, newest first.'
			}, { max: 160 }),
			text('hall.drivers', { pt: 'Texto sobre os antigos pilotos', en: 'Text about former drivers' }, {
				pt: "Correram pela K'ART. A maioria continua a correr, agora noutras equipas.",
				en: "They raced for K'ART. Most of them still race, now for other teams."
			}, { max: 160 }),
			text('hall.empty', EMPTY, {
				pt: 'O primeiro capítulo ainda está a ser escrito.',
				en: 'The first chapter is still being written.'
			}, { max: 160 })
		]
	},
	{
		id: 'news',
		label: { pt: 'Notícias', en: 'News' },
		desc: {
			pt: 'O título da página de notícias, também usado na página inicial.',
			en: 'The title of the news page, also used on the home page.'
		},
		path: { pt: '/noticias', en: '/en/news' },
		fields: [
			line('news.eyebrow', EYEBROW, { pt: 'Notícias', en: 'News' }, { max: 40 }),
			title('news.title', { pt: ['Direto do', 'paddock'], en: ['From the', 'paddock'] }),
			text('news.intro', INTRO, {
				pt: 'Crónicas de corrida, resultados e novidades da equipa.',
				en: 'Race reports, results and team news.'
			}, { max: 200 }),
			text('news.empty', EMPTY, {
				pt: 'Ainda não há notícias. Volte depois da próxima prova.',
				en: 'No news yet. Check back after the next race.'
			}, { max: 160 })
		]
	},
	{
		id: 'partners',
		label: { pt: 'Parceiros', en: 'Partners' },
		desc: {
			pt: 'A apresentação aos patrocinadores e as quatro posições no kart. A introdução também aparece na página inicial.',
			en: 'The pitch to sponsors and the four positions on the kart. The introduction also appears on the home page.'
		},
		path: { pt: '/parceiros', en: '/en/partners' },
		fields: [
			...part({ pt: 'Apresentação', en: 'Introduction' }, [
				line('partners.eyebrow', EYEBROW, { pt: 'Patrocínios', en: 'Partnerships' }, { max: 40 }),
				title('partners.title', { pt: ['O seu nome', 'no kart'], en: ['Your name', 'on the kart'] }),
				text(
					'partners.intro',
					INTRO,
					{
						pt: 'Somos uma equipa jovem e em crescimento, a correr perante público e câmaras por todo o país.',
						en: 'We are a young team on the way up, racing in front of crowds and cameras across Portugal.'
					},
					{
						max: 260,
						hint: {
							pt: 'O número de karts na grelha é acrescentado a seguir, automaticamente.',
							en: 'The number of karts on the grid follows automatically.'
						}
					}
				),
			] as const),
			...part({ pt: 'As quatro posições no kart', en: 'The four positions on the kart' }, [
				...position('pods', 1, { pt: 'Pontões laterais', en: 'Sidepods' }, { pt: 'Patrocinador principal', en: 'Title partner' }, {
					pt: 'A maior superfície do kart, em todos os karts da equipa, com presença no equipamento e direito ao nome.',
					en: 'The largest surface on the kart, on every kart in the team, plus team kit and naming rights.'
				}),
				...position('nassau', 2, { pt: 'Painel Nassau', en: 'Nassau panel' }, same('Premium'), {
					pt: 'O painel à frente do volante, exatamente para onde apontam todas as câmaras onboard.',
					en: 'The panel in front of the steering wheel, right where every onboard camera points.'
				}),
				...position('nose', 3, { pt: 'Carenagem frontal', en: 'Front fairing' }, { pt: 'Técnico', en: 'Technical' }, {
					pt: 'A primeira coisa a aparecer em cada fotografia da grelha e do pódio.',
					en: 'First thing in frame on every grid photo and podium picture.'
				}),
				...position('bumper', 4, { pt: 'Para-choques traseiro', en: 'Rear bumper' }, { pt: 'Apoio', en: 'Supporter' }, {
					pt: 'Visto por todos os que ultrapassamos. É precisamente essa a ideia.',
					en: 'Seen by everyone we overtake. That is rather the point.'
				})
			] as const)
		]
	},
	{
		id: 'contact',
		label: { pt: 'Contacto', en: 'Contact' },
		desc: {
			pt: 'Os textos da página de contacto. O título e a introdução também fecham a página inicial.',
			en: 'The texts on the contact page. The title and introduction also close the home page.'
		},
		path: { pt: '/contacto', en: '/en/contact' },
		fields: [
			line('contact.eyebrow', EYEBROW, { pt: 'Contacto', en: 'Contact' }, { max: 40 }),
			title('contact.title', { pt: ['Vamos', 'correr.'], en: ["Let's go", 'racing.'] }),
			text('contact.lead', INTRO, {
				pt: 'Correr connosco, parcerias ou imprensa. Escreva-nos e respondemos em breve.',
				en: "Racing with us, partnerships or press. Write to us and we'll get back to you."
			}, { max: 200 }),
			text('contact.tryouts', { pt: 'Para pilotos', en: 'For drivers' }, {
				pt: 'Os testes de captação decorrem durante a pré-temporada, para pilotos a partir dos 8 anos, de estreantes a pilotos à procura de uma equipa que os leve mais longe.',
				en: 'Tryouts run through the off-season for drivers aged 8 and up, from first-timers to racers looking for a team that can take them further.'
			}, { max: 260 }),
			text('contact.press', { pt: 'Para parceiros e imprensa', en: 'For partners and press' }, {
				pt: 'Dossiês de patrocínio, kits de imprensa e fotografias da temporada disponíveis a pedido.',
				en: 'Partner decks, press kits and season photography are available on request.'
			}, { max: 260 })
		]
	}
] as const;

export type GroupId = (typeof GROUPS)[number]['id'];
type AnyField = (typeof GROUPS)[number]['fields'][number];
export type TextKey = AnyField['key'];
/** Titles, written one line per row */
export type LinesKey = Extract<AnyField, { kind: 'lines' }>['key'];
/** Everything else: single lines and paragraphs */
export type StringKey = Exclude<TextKey, LinesKey>;

/** The texts as saved: each key in both languages */
export type Texts = Partial<Record<TextKey, L | L<string[]>>>;

export const FIELDS: readonly Field[] = GROUPS.flatMap((g) => g.fields as readonly Field[]);
const BY_KEY = new Map(FIELDS.map((f) => [f.key, f]));
const GROUP_OF = new Map(GROUPS.flatMap((g) => g.fields.map((f) => [f.key as string, g.id as GroupId])));

export const field = (key: string) => BY_KEY.get(key);
export const groupOf = (key: string) => GROUP_OF.get(key);
export const group = (id: string) => GROUPS.find((g) => g.id === id);

/** The saved texts with every missing one filled in from its starting text */
export function withStarts(saved: Texts | undefined): Texts {
	const out: Texts = {};
	for (const f of FIELDS) out[f.key as TextKey] = saved?.[f.key as TextKey] ?? f.start;
	return out;
}

/** A single line or paragraph, in the language asked for, falling back to the other */
export const textIn = (texts: Texts | undefined, key: StringKey, lang: Lang) =>
	tr((texts?.[key] ?? BY_KEY.get(key)?.start) as L, lang);

/** A title's lines, in the language asked for, falling back to the other */
export const linesIn = (texts: Texts | undefined, key: LinesKey, lang: Lang) =>
	tr((texts?.[key] ?? BY_KEY.get(key)?.start) as L<string[]>, lang).filter((l) => l.trim());
