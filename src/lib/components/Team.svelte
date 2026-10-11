<script lang="ts">
	import Arrow from './Arrow.svelte';
	import SectionHead from './SectionHead.svelte';
	import { inview, countup } from '#lib/motion.ts';
	import { seasonSummary, type Pilot, type Round } from '#lib/content.ts';
	import { useI18n, pagePath } from '#lib/i18n.ts';

	interface Props {
		pilots: Pilot[];
		season: Round[];
		year: number;
		/** Sector on the home page, which shows the statement and numbers with a link to the team page */
		index?: string;
		/** The team page, with its own heading and the three pillars */
		page?: boolean;
	}

	let { pilots, season, year, index, page = false }: Props = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.team);

	const pillars = $derived(
		([1, 2, 3] as const).map((n) => ({
			title: i18n.text(`team.pillar${n}.title`),
			body: i18n.text(`team.pillar${n}.body`)
		}))
	);

	// This season so far, counted from the results entered in the calendar
	const stats = $derived.by(() => {
		const summary = seasonSummary(season);
		const classes = new Set(pilots.map((p) => p.category)).size;
		return [
			{
				value: summary.wins,
				label: t.wins(year),
				note: summary.raced ? t.winsNote(summary.raced, season.length) : i18n.t.season.notStarted
			},
			{ value: summary.podiums, label: t.podiums(year), note: t.podiumsNote },
			{ value: pilots.length, label: t.drivers, note: t.driversNote(classes) },
			{
				value: summary.podiumRounds,
				of: summary.raced,
				label: t.seasonPodiums,
				note: summary.raced && summary.podiumRounds === summary.raced ? t.seasonAll : t.seasonSome
			}
		];
	});
</script>

<section id="team" class="team" class:page data-sector={index && ''}>
	<div class="wrap">
		{#if page}
			<SectionHead level={1} eyebrow={i18n.text('team.eyebrow')} lines={i18n.lines('team.title')} accent={-1}>
				<p>{i18n.text('team.statement')} {i18n.text('team.statementMore')}</p>
			</SectionHead>
		{:else}
			<div class="intro" use:inview>
				<p class="eyebrow rv"><b>{index}</b> · {i18n.text('team.eyebrow')}</p>
				<div>
					<p class="statement rv" style:--d="100ms">
						{i18n.text('team.statement')}
						<span>{i18n.text('team.statementMore')}</span>
					</p>
					<a class="pagelink more rv" style:--d="200ms" href={pagePath('team', i18n.lang)}>{t.more} <Arrow /></a>
				</div>
			</div>
		{/if}

		<dl class="stats" use:inview>
			{#each stats as s, i}
				<div class="stat rv" style:--d="{i * 90}ms">
					<dt>{s.label}</dt>
					<dd class="num">
						<span use:countup={s.value}>{s.value}</span>{#if s.of !== undefined}<span class="of"
								>/{s.of}</span
							>{/if}
					</dd>
					<p>{s.note}</p>
				</div>
			{/each}
		</dl>

		{#if page}
			<div class="pillars" use:inview>
				{#each pillars as p, i}
					<article class="rv" style:--d="{i * 90}ms">
						<span class="idx num">0{i + 1}</span>
						<h2>{p.title}</h2>
						<p>{p.body}</p>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	.team {
		padding-block: var(--section);
	}
	.team.page {
		padding-top: var(--page-top);
	}
	.page .stats {
		margin-top: 0;
	}

	.intro {
		display: grid;
		gap: 2rem;
	}
	.statement {
		max-width: 21em;
		font-size: var(--t-section);
		font-weight: 600;
		font-stretch: 108%;
		line-height: 1.08;
		letter-spacing: -0.03em;
		text-wrap: balance;
	}
	.statement span {
		color: var(--fg-3);
	}
	.more {
		margin-top: 2rem;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		margin-top: clamp(3rem, 6vw, 5.5rem);
		border-top: 1px solid var(--hair-2);
	}
	.stat {
		display: flex;
		flex-direction: column;
		padding: 1.5rem 1.25rem 2rem 0;
		border-bottom: 1px solid var(--hair);
	}
	.stat:nth-child(even) {
		padding-left: 1.25rem;
		border-left: 1px solid var(--hair);
	}
	dt {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-2);
	}
	dd {
		order: -1;
		margin-bottom: 1rem;
		font-size: var(--t-stat);
	}
	.of {
		color: var(--fg-3);
	}
	.stat:last-child dd {
		color: var(--lime);
	}
	.stat p {
		margin-top: 0.5rem;
		max-width: 16rem;
		font-size: 0.875rem;
		color: var(--fg-3);
	}

	.pillars {
		display: grid;
		gap: 2.5rem;
		margin-top: clamp(3.5rem, 7vw, 6rem);
	}
	article {
		padding-top: 1.5rem;
		border-top: 1px solid var(--hair-2);
	}
	.idx {
		font-size: 1rem;
		color: var(--blue);
	}
	h2 {
		margin-top: clamp(1.25rem, 3vw, 2.5rem);
		font-size: var(--t-card);
		font-weight: 800;
		font-style: italic;
		font-stretch: 125%;
		letter-spacing: -0.02em;
		line-height: 1;
		text-transform: uppercase;
	}
	article p {
		margin-top: 1rem;
		max-width: 26rem;
		color: var(--fg-2);
	}

	@media (min-width: 900px) {
		.intro {
			grid-template-columns: minmax(0, 3fr) minmax(0, 9fr);
		}
		.eyebrow {
			align-self: start;
			padding-top: 0.9rem;
		}
		.stats {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
		.stat {
			padding: 1.75rem 1.5rem 0 1.5rem;
			border-bottom: 0;
		}
		.stat:first-child {
			padding-left: 0;
		}
		.stat + .stat {
			border-left: 1px solid var(--hair);
		}
		.pillars {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 1.5rem;
		}
	}
</style>
