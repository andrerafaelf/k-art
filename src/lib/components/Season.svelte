<script lang="ts">
	import SectionHead from './SectionHead.svelte';
	import CalendarLinks from './CalendarLinks.svelte';
	import { numbered, roundEnd, nextRound, seasonSummary, bestResult, longRange, dayRange, tr } from '#lib/content.ts';
	import type { Round, Settings } from '#lib/content.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	// The season page: countdown to the next race, then every round with its results

	let { season, settings }: { season: Round[]; settings: Settings } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.season);

	let now = $state(Date.now());

	$effect(() => {
		now = Date.now();
		const id = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(id);
	});

	const rounds = $derived(numbered(season));
	const next = $derived(nextRound(rounds, now));
	const summary = $derived(seasonSummary(season));

	const countdown = $derived.by(() => {
		if (!next) return [];
		const s = Math.max(0, Math.floor((new Date(next.date).getTime() - now) / 1000));
		return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
	});

	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<section id="season" class="season">
	<div class="wrap">
		<SectionHead
			level={1}
			eyebrow="{i18n.text('season.eyebrow')} {settings.seasonYear}"
			lines={i18n.lines('season.title')}
			accent={-1}
		>
			{#if season.length}
				<p>
					{i18n.text('season.intro')}
					<strong>
						{summary.raced ? t.soFar(summary.wins, summary.podiums, summary.raced) : t.notStarted}
					</strong>
				</p>
				<div class="subscribe">
					<CalendarLinks label={i18n.t.calendar.label} />
				</div>
			{:else}
				<p>{i18n.text('season.empty')}</p>
			{/if}
		</SectionHead>

		{#if next}
			<div class="next striped" use:inview>
				<div class="next-info rv">
					<p class="eyebrow">{t.next(next.round, rounds.length)}</p>
					<h3>{next.location}</h3>
					<p class="where">
						{tr(next.venue, i18n.lang)}, {longRange(next, i18n.lang, { year: false, weekday: true })}
					</p>
				</div>
				<div class="clock rv" style:--d="120ms" role="timer" aria-label={t.timer}>
					{#each countdown as value, i}
						<div>
							<span class="num">{pad(value)}</span>
							<small>{t.units[i]}</small>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if rounds.length}
			<ol class="board" use:inview>
				{#each rounds as r, i (r.id)}
					{@const past = roundEnd(r) <= now}
					{@const isNext = r === next}
					{@const best = bestResult(r)}
				{@const when = dayRange(r, i18n.lang)}
					<li class="row rv" class:past class:is-next={isNext} style:--d="{i * 60}ms">
						<span class="rd num"><small>{t.roundPrefix}</small>{r.round}<small>{t.roundSuffix}</small></span>
						<span class="date">
							<span class="num">{when.days}</span>
							<span>{when.month}</span>
						</span>
						<span class="venue">
							<span class="v">{r.location}</span>
							<span class="loc">{tr(r.venue, i18n.lang)}</span>
						</span>
						<span class="series">{tr(r.series, i18n.lang)}</span>
						<span class="res">
							{#if best}
								<span class="pos num" class:win={best.pos === 1}>P{best.pos}</span>
								<span class="drv">{best.name}</span>
								{#if r.results.length > 1}
									<span class="more">+{r.results.length - 1}</span>
								{/if}
							{:else if isNext}
								<span class="tag-next">{t.nextUp}</span>
							{:else if past}
								<span class="muted">{t.pending}</span>
							{:else}
								<span class="muted">{t.upcoming}</span>
							{/if}
						</span>
					</li>
				{/each}
			</ol>
		{/if}
	</div>
</section>

<style>
	.season {
		padding-block: var(--page-top) var(--section);
	}
	.season :global(.intro strong) {
		color: var(--fg);
		font-weight: 600;
	}
	.subscribe {
		margin-top: 1.75rem;
	}

	/* ---------- next race ---------- */
	.next {
		display: grid;
		gap: 2rem;
		padding: clamp(1.5rem, 2.5vw, 2rem);
		margin-bottom: clamp(2.5rem, 5vw, 4rem);
		background: radial-gradient(80% 140% at 100% 0%, rgb(214 249 6 / 0.08), transparent 60%), var(--bg-1);
		box-shadow: inset 0 0 0 1px var(--hair-2);
	}
	.next .eyebrow {
		color: rgb(243 243 239 / 0.6);
	}
	.next .eyebrow::before {
		background: var(--lime);
	}
	h3 {
		margin-top: 1rem;
		font-size: var(--t-section);
		font-style: italic;
		font-weight: 900;
		font-stretch: 125%;
		letter-spacing: -0.035em;
		line-height: 0.9;
		text-transform: uppercase;
	}
	.where {
		margin-top: 0.75rem;
		color: rgb(243 243 239 / 0.6);
	}
	.clock {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		align-self: end;
	}
	.clock div {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding-inline: 0.9rem;
		border-left: 1px solid rgb(255 255 255 / 0.12);
	}
	.clock .num {
		font-family: var(--mono);
		font-style: normal;
		font-stretch: 100%;
		font-weight: 600;
		font-size: var(--t-figure);
		color: var(--lime);
	}
	.clock small {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: rgb(243 243 239 / 0.5);
	}

	/* ---------- board ---------- */
	.board {
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--hair-2);
	}
	.row {
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-columns: 3.5rem 1fr auto;
		grid-template-areas:
			'rd venue res'
			'rd date series';
		gap: 0.35rem 1rem;
		align-items: center;
		padding: 1rem 0;
		border-bottom: 1px solid var(--hair-2);
	}
	.row::before {
		content: '';
		position: absolute;
		inset: 0 calc(var(--gutter) * -0.5);
		z-index: -1;
		background: rgb(255 255 255 / 0.035);
		opacity: 0;
		transition: opacity 0.3s;
	}
	.row:hover::before {
		opacity: 1;
	}
	.rd {
		grid-area: rd;
		font-size: 2rem;
	}
	.rd small {
		font-size: 0.45em;
		margin-right: 0.08em;
		color: var(--fg-3);
	}
	.date {
		grid-area: date;
		display: flex;
		gap: 0.35rem;
		font-size: 0.875rem;
		color: var(--fg-2);
	}
	.date .num {
		font-size: inherit;
		font-stretch: 100%;
		font-weight: 600;
		color: var(--fg);
	}
	.venue {
		grid-area: venue;
		min-width: 0;
	}
	.v {
		display: block;
		font-size: var(--t-card);
		font-style: italic;
		font-weight: 900;
		font-stretch: 125%;
		letter-spacing: -0.03em;
		line-height: 1.05;
		text-transform: uppercase;
	}
	.loc {
		display: none;
		margin-top: 0.3rem;
		font-size: 0.875rem;
		color: var(--fg-2);
	}
	.series {
		grid-area: series;
		justify-self: end;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-2);
	}
	.res {
		grid-area: res;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.6rem;
		font-weight: 600;
	}
	.pos {
		display: grid;
		place-items: center;
		min-width: 2.6rem;
		height: 2.1rem;
		padding-inline: 0.4rem;
		font-size: 1.35rem;
		line-height: 1;
		box-shadow: inset 0 0 0 1.5px var(--fg);
	}
	.pos.win {
		background: var(--lime);
		color: var(--black);
		box-shadow: none;
		clip-path: polygon(0 0, 100% 0, calc(100% - 7px) 100%, 0 100%);
	}
	.drv {
		display: none;
	}
	.more {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--fg-3);
	}
	.tag-next {
		padding: 0.5rem 0.75rem;
		background: var(--lime);
		color: var(--black);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.row.is-next .tag-next {
		background: var(--black);
		color: var(--lime);
	}
	.muted {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--fg-3);
	}
	.row.past .rd,
	.row.past .v {
		color: var(--fg-2);
	}
	/* The next round, lit up in lime with dark text */
	.row.is-next {
		--fg: var(--black);
		--fg-2: rgb(10 10 11 / 0.72);
		--fg-3: rgb(10 10 11 / 0.55);
		color: var(--black);
	}
	.row.is-next::before {
		opacity: 1;
		background: var(--lime);
	}

	@media (min-width: 560px) {
		.drv {
			display: inline;
		}
	}

	@media (min-width: 900px) {
		.next {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: end;
		}
		.clock div {
			min-width: 6rem;
			padding-inline: 1.1rem;
		}
		.row {
			grid-template-columns: 5rem 6rem minmax(0, 1fr) 11rem 13rem;
			grid-template-areas: 'rd date venue series res';
			padding: 1.1rem 0;
		}
		.rd {
			font-size: 2.25rem;
		}
		.date {
			flex-direction: column;
			gap: 0;
			font-size: 0.75rem;
			letter-spacing: 0.12em;
			text-transform: uppercase;
		}
		.date .num {
			font-size: 1.5rem;
			font-stretch: 70%;
			font-weight: 800;
			letter-spacing: 0;
		}
		.loc {
			display: block;
		}
		.series {
			justify-self: start;
		}
	}
</style>
