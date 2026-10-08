import type { Alumnus, Content, L, Pilot, Round, SeasonArchive } from '#lib/content.ts';

// First-run content, written to content.json when no data file exists yet.
// Names, numbers, results and dates are placeholders.

const same = (s: string): L => ({ pt: s, en: s });

const pilots: Pilot[] = [
	{
		id: 'tomas-freitas',
		number: 7,
		first: 'Tomás',
		last: 'Freitas',
		category: 'Sénior X30',
		age: 19,
		hometown: 'Funchal',
		since: 2017,
		chassis: 'Tony Kart Racer 401',
		engine: 'IAME X30',
		accent: 'lime',
		record: { starts: 64, wins: 11, podiums: 27, poles: 9 },
		best: same('P2, Campeonato de Portugal 2025'),
		quote: {
			pt: 'Aprende-se a travar tarde quando a ilha só tem uma pista.',
			en: 'You learn to brake late when the island only has one track.'
		}
	},
	{
		id: 'beatriz-gouveia',
		number: 11,
		first: 'Beatriz',
		last: 'Gouveia',
		category: 'Júnior X30',
		age: 15,
		hometown: 'Machico',
		since: 2019,
		chassis: 'Kosmic Mercury R',
		engine: 'IAME X30 Junior',
		accent: 'cyan',
		record: { starts: 41, wins: 6, podiums: 15, poles: 5 },
		best: { pt: 'P1, Regional da Madeira 2025', en: 'P1, Madeira Regional 2025' },
		quote: {
			pt: 'Primeiro voltas limpas. As rápidas vêm depois.',
			en: 'Clean laps first. The fast ones come after.'
		}
	},
	{
		id: 'rodrigo-abreu',
		number: 23,
		first: 'Rodrigo',
		last: 'Abreu',
		category: 'KZ2',
		age: 22,
		hometown: 'Câmara de Lobos',
		since: 2014,
		chassis: 'CRG Road Rebel',
		engine: 'TM KZ-R2',
		accent: 'lime',
		record: { starts: 97, wins: 18, podiums: 39, poles: 14 },
		best: same('P3, Taça de Portugal KZ2 2024'),
		quote: { pt: 'Seis mudanças, sem espaço para dúvidas.', en: 'Six gears, no room for doubt.' }
	},
	{
		id: 'duarte-nobrega',
		number: 4,
		first: 'Duarte',
		last: 'Nóbrega',
		category: 'Cadete',
		age: 11,
		hometown: 'Santa Cruz',
		since: 2022,
		chassis: 'Parolin Mini',
		engine: 'IAME Swift',
		accent: 'cyan',
		record: { starts: 22, wins: 3, podiums: 9, poles: 2 },
		best: { pt: 'P1, Regional da Madeira 2026, 2.ª prova', en: 'P1, Madeira Regional 2026, round 2' },
		quote: { pt: 'Quero ser mais rápido do que o meu pai.', en: 'I want to go faster than my dad.' }
	},
	{
		id: 'leonor-teixeira',
		number: 31,
		first: 'Leonor',
		last: 'Teixeira',
		category: 'Juvenil',
		age: 13,
		hometown: 'Caniço',
		since: 2020,
		chassis: 'Birel ART AM29',
		engine: 'IAME X30 Junior',
		accent: 'lime',
		record: { starts: 35, wins: 4, podiums: 13, poles: 3 },
		best: { pt: 'P2, Campeonato de Portugal 2026, 3.ª prova', en: 'P2, Campeonato de Portugal 2026, round 3' },
		quote: { pt: 'Os dias de chuva são os meus preferidos.', en: 'Rain days are my favourite days.' }
	},
	{
		id: 'martim-jardim',
		number: 88,
		first: 'Martim',
		last: 'Jardim',
		category: 'Rotax Max',
		age: 17,
		hometown: 'Ribeira Brava',
		since: 2016,
		chassis: 'Sodi Sigma',
		engine: 'Rotax 125 Max EVO',
		accent: 'cyan',
		record: { starts: 58, wins: 9, podiums: 22, poles: 6 },
		best: same('P4, Rotax Max Challenge Portugal 2025'),
		quote: {
			pt: 'Uma ultrapassagem planeia-se três curvas antes.',
			en: 'Overtakes are planned three corners early.'
		}
	}
];

const home = same('Kartódromo do Faial');
const result = (pilotId: string, name: string, pos: number) => [{ pilotId, name, pos }];

const season: Round[] = [
	{ id: 'r1', location: 'Palmela', venue: same('Kartódromo Internacional de Palmela'), date: '2026-03-14', series: same('CPK'), results: result('rodrigo-abreu', 'Abreu', 1) },
	{ id: 'r2', location: 'Faial', venue: home, date: '2026-04-25', series: same('Regional'), results: result('duarte-nobrega', 'Nóbrega', 1) },
	{ id: 'r3', location: 'Paredes', venue: same('Kartódromo de Baltar'), date: '2026-05-30', series: same('CPK'), results: result('leonor-teixeira', 'Teixeira', 2) },
	{ id: 'r4', location: 'Portimão', venue: same('Kartódromo Internacional do Algarve'), date: '2026-07-11', series: same('CPK'), results: result('tomas-freitas', 'Freitas', 3) },
	{ id: 'r5', location: 'Faial', venue: home, date: '2026-09-12', series: same('Regional'), results: result('beatriz-gouveia', 'Gouveia', 1) },
	{ id: 'r6', location: 'Braga', venue: same('Kartódromo Internacional de Braga'), date: '2026-10-17', series: same('CPK'), results: [] },
	{ id: 'r7', location: 'Faial', venue: home, date: '2026-11-21', series: { pt: 'Regional, prova final', en: 'Regional, final round' }, results: [] }
];

const lines = (pt: string[], en: string[]): L<string[]> => ({ pt, en });

// Hall of Fame placeholders: replace with the team's real history in the admin
const history: SeasonArchive[] = [
	{
		id: 's2025',
		year: 2025,
		headline: { pt: 'Campeões regionais', en: 'Regional champions' },
		summary: {
			pt: 'O ano em que a equipa ganhou o primeiro título. Seis pódios no Campeonato de Portugal e o Regional da Madeira decidido na última prova, no Faial.',
			en: 'The year the team won its first title. Six podiums in the Portuguese championship and the Madeira regional series decided at the final round, in Faial.'
		},
		stats: { rounds: 8, wins: 5, podiums: 13, poles: 4 },
		titles: lines(
			['Beatriz Gouveia, Campeã Regional da Madeira, Júnior X30', 'Tomás Freitas, Vice-campeão de Portugal, Sénior X30'],
			['Beatriz Gouveia, Madeira Regional Champion, Junior X30', 'Tomás Freitas, Portuguese runner-up, Senior X30']
		),
		lineup: 'Freitas, Gouveia, Abreu, Teixeira, Jardim, Mendonça'
	},
	{
		id: 's2024',
		year: 2024,
		headline: { pt: 'O primeiro ano', en: 'Year one' },
		summary: {
			pt: 'Primeira temporada completa: quatro pilotos, um contentor e a primeira vitória da equipa no continente, em Palmela.',
			en: "The first full season: four drivers, one container and the team's first win on the mainland, at Palmela."
		},
		stats: { rounds: 7, wins: 2, podiums: 7, poles: 1 },
		titles: lines(['Rodrigo Abreu, 3.º na Taça de Portugal KZ2'], ['Rodrigo Abreu, 3rd in the Taça de Portugal KZ2']),
		lineup: 'Abreu, Freitas, Mendonça, Silva'
	}
];

const alumni: Alumnus[] = [
	{
		id: 'joao-mendonca',
		number: 14,
		first: 'João',
		last: 'Mendonça',
		accent: 'cyan',
		from: 2024,
		to: 2025,
		categories: 'Sénior X30',
		record: { starts: 30, wins: 3, podiums: 9, poles: 2 },
		titles: lines(['Primeira pole da equipa, Baltar 2024'], ["The team's first pole, Baltar 2024"]),
		now: { pt: 'Fórmula 4 Espanhola', en: 'Spanish Formula 4' }
	},
	{
		id: 'ines-silva',
		number: 9,
		first: 'Inês',
		last: 'Silva',
		accent: 'lime',
		from: 2024,
		to: 2024,
		categories: 'Júnior X30',
		record: { starts: 14, wins: 1, podiums: 4, poles: 0 },
		titles: lines(['Vitória no Regional da Madeira 2024'], ['Win in the 2024 Madeira regional series']),
		now: { pt: 'Campeonato Europeu de Karting', en: 'European Karting Championship' }
	}
];

export const seed = (): Content => ({
	settings: {
		seasonYear: 2026,
		email: 'geral@k-art.pt',
		instagram: 'kart.racingteam',
		location: 'Faial, Madeira, Portugal',
		heroEyebrow: { pt: 'Equipa de karting, Madeira, Portugal', en: 'Karting team, Madeira, Portugal' },
		heroLines: { pt: ['Do Atlântico', 'para o', 'pódio.'], en: ['From the', 'Atlantic', 'to the', 'front row.'] },
		heroLead: {
			pt: "A K'ART Racing Team é uma nova equipa de karting da Madeira, sediada no Kartódromo do Faial. Seis pilotos e um só objetivo em cada fim de semana de corrida: o lugar mais alto do pódio.",
			en: "K'ART Racing Team is a new karting team from Madeira, based at the Kartódromo do Faial. Six drivers and one goal every race weekend: the top step."
		},
		seasonIntro: {
			pt: 'Provas do Campeonato de Portugal de Karting e do Regional da Madeira.',
			en: 'Rounds across the Portuguese championship and the Madeira regional series.'
		},
		partnersIntro: {
			pt: 'Somos uma equipa jovem e em crescimento, a correr perante público e câmaras por todo o país.',
			en: 'We are a young team on the way up, racing in front of crowds and cameras across Portugal.'
		},
		packages: [
			{
				zone: 'pods',
				tier: { pt: 'Patrocinador principal', en: 'Title partner' },
				title: { pt: 'Pontões laterais', en: 'Sidepods' },
				body: {
					pt: 'A maior superfície do kart, em todos os karts da equipa, com presença no equipamento e direito ao nome.',
					en: 'The largest surface on the kart, on every kart in the team, plus team kit and naming rights.'
				}
			},
			{
				zone: 'nassau',
				tier: same('Premium'),
				title: { pt: 'Painel Nassau', en: 'Nassau panel' },
				body: {
					pt: 'O painel à frente do volante, exatamente para onde apontam todas as câmaras onboard.',
					en: 'The panel in front of the steering wheel, right where every onboard camera points.'
				}
			},
			{
				zone: 'nose',
				tier: { pt: 'Técnico', en: 'Technical' },
				title: { pt: 'Carenagem frontal', en: 'Front fairing' },
				body: {
					pt: 'A primeira coisa a aparecer em cada fotografia da grelha e do pódio.',
					en: 'First thing in frame on every grid photo and podium picture.'
				}
			},
			{
				zone: 'bumper',
				tier: { pt: 'Apoio', en: 'Supporter' },
				title: { pt: 'Para-choques traseiro', en: 'Rear bumper' },
				body: {
					pt: 'Visto por todos os que ultrapassamos. É precisamente essa a ideia.',
					en: 'Seen by everyone we overtake. That is rather the point.'
				}
			}
		],
		tryouts: {
			pt: 'Os testes de captação decorrem durante a pré-temporada, para pilotos a partir dos 8 anos, de estreantes a pilotos à procura de uma equipa que os leve mais longe.',
			en: 'Tryouts run through the off-season for drivers aged 8 and up, from first-timers to racers looking for a team that can take them further.'
		},
		press: {
			pt: 'Dossiês de patrocínio, kits de imprensa e fotografias da temporada disponíveis a pedido.',
			en: 'Partner decks, press kits and season photography are available on request.'
		}
	},
	pilots: structuredClone(pilots),
	season: structuredClone(season),
	partners: [],
	posts: [],
	alumni: structuredClone(alumni),
	history: structuredClone(history),
	updatedAt: new Date(0).toISOString()
});
