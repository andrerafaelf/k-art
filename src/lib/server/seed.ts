import type { Alumnus, Content, L, Pilot, Round, SeasonArchive } from '#lib/content.ts';
import { withStarts } from '#lib/texts.ts';

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
		country: 'pt'
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
		country: 'pt'
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
		country: 'pt'
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
		country: 'pt'
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
		country: 'pt'
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
		country: 'pt'
	}
];

const home = same('Kartódromo do Faial');
const result = (pilotId: string, name: string, pos: number) => [{ pilotId, name, pos }];

const season: Round[] = [
	{ id: 'r1', location: 'Palmela', venue: same('Kartódromo Internacional de Palmela'), date: '2026-03-14', days: 2, series: same('CPK'), results: result('rodrigo-abreu', 'Abreu', 1) },
	{ id: 'r2', location: 'Faial', venue: home, date: '2026-04-25', days: 2, series: same('Regional'), results: result('duarte-nobrega', 'Nóbrega', 1) },
	{ id: 'r3', location: 'Paredes', venue: same('Kartódromo de Baltar'), date: '2026-05-30', days: 2, series: same('CPK'), results: result('leonor-teixeira', 'Teixeira', 2) },
	{ id: 'r4', location: 'Portimão', venue: same('Kartódromo Internacional do Algarve'), date: '2026-07-11', days: 2, series: same('CPK'), results: result('tomas-freitas', 'Freitas', 3) },
	{ id: 'r5', location: 'Faial', venue: home, date: '2026-09-12', days: 2, series: same('Regional'), results: result('beatriz-gouveia', 'Gouveia', 1) },
	{ id: 'r6', location: 'Braga', venue: same('Kartódromo Internacional de Braga'), date: '2026-10-17', days: 2, series: same('CPK'), results: [] },
	{ id: 'r7', location: 'Faial', venue: home, date: '2026-11-21', days: 2, series: { pt: 'Regional, prova final', en: 'Regional, final round' }, results: [] }
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
		email: 'geral@k-artracing.com',
		instagram: 'kart.racingteam',
		location: 'Faial, Madeira, Portugal'
	},
	pilots: structuredClone(pilots),
	season: structuredClone(season),
	partners: [],
	posts: [],
	alumni: structuredClone(alumni),
	history: structuredClone(history),
	texts: withStarts(undefined),
	updatedAt: new Date(0).toISOString()
});
