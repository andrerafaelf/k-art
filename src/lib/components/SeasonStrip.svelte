<script lang="ts">
	import TeaserHead from './TeaserHead.svelte';
	import { numbered, roundEnd, nextRound, seasonSummary, bestResult, shortDate } from '#lib/content.ts';
	import type { Round } from '#lib/content.ts';
	import { useI18n, pagePath } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	// The season on the home page: every round in one strip, with the team's best
	// result where it has raced and the next round lit up. The season page has the rest.

	let { season, year, index }: { season: Round[]; year: number; index: string } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.season);

	// Rounds change state at the end of a race weekend, so the time only needs to be roughly right
	let now = $state(Date.now());
	$effect(() => {
		now = Date.now();
		const id = setInterval(() => (now = Date.now()), 60_000);
		return () => clearInterval(id);
	});

	const rounds = $derived(numbered(season));
	const next = $derived(nextRound(rounds, now));
	const summary = $derived(seasonSummary(season));
</script>

<section id="season" class="strip" data-sector>
	<div class="wrap">
		<TeaserHead {index} eyebrow={t.eyebrow(year)} lines={t.title} href={pagePath('season', i18n.lang)} link={t.all}>
			{summary.raced ? t.soFar(summary.wins, summary.podiums, summary.raced) : t.notStarted}
		</TeaserHead>

		<ol class="rounds" use:inview>
			{#each rounds as r, i (r.id)}
				{@const past = roundEnd(r) <= now}
				{@const isNext = r === next}
				{@const best = bestResult(r)}
				<li class="rv" class:past class:next={isNext} style:--d="{i * 50}ms">
					<span class="top mono">
						<span>{t.roundPrefix}{r.round}{t.roundSuffix}</span>
						<span>{shortDate(r.date, i18n.lang)}</span>
					</span>
					<span class="v">{r.location}</span>
					<span class="res">
						{#if best}
							<span class="pos num" class:win={best.pos === 1}>P{best.pos}</span>
							<span class="drv">{best.name}</span>
						{:else if isNext}
							<span class="tag">{t.nextUp}</span>
						{:else}
							<span class="muted">{past ? t.pending : t.upcoming}</span>
						{/if}
					</span>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	.strip {
		padding-block: var(--section);
	}

	/* Phones: a swipeable strip. Wider screens: every round side by side. */
	.rounds {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 10.5rem;
		gap: 1px;
		margin: 0 calc(var(--gutter) * -1);
		padding: 0 var(--gutter);
		list-style: none;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-snap-type: x mandatory;
		scroll-padding-inline: var(--gutter);
		scrollbar-width: none;
	}
	.rounds::-webkit-scrollbar {
		display: none;
	}
	li {
		container-type: inline-size;
		scroll-snap-align: start;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-height: 11rem;
		padding: 1.15rem 1rem 1.25rem;
		background: var(--bg-1);
		box-shadow: inset 0 3px 0 var(--hair-2);
	}
	/* Raced rounds carry the team's colour along the top, like the stripe on the suits */
	li.past {
		box-shadow: inset 0 3px 0 var(--blue);
	}
	.top {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.top span:first-child {
		color: var(--fg-2);
		font-weight: 700;
	}
	/* As large as the tile allows, so a ten-letter town still fits on one line */
	.v {
		font-size: clamp(0.95rem, 11cqi, 1.3rem);
		font-style: italic;
		font-weight: 900;
		font-stretch: 125%;
		letter-spacing: -0.02em;
		line-height: 1;
		text-transform: uppercase;
		overflow-wrap: anywhere;
	}
	.res {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		margin-top: auto;
		min-height: 2.1rem;
		font-size: 0.875rem;
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
		clip-path: polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
	}
	.drv {
		overflow: hidden;
		color: var(--fg-2);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.muted {
		font-weight: 500;
		color: var(--fg-3);
	}

	/* The next round, lit up in lime */
	li.next {
		--fg: var(--black);
		--fg-2: rgb(10 10 11 / 0.72);
		--fg-3: rgb(10 10 11 / 0.55);
		background: var(--lime);
		color: var(--black);
		box-shadow: none;
	}
	.tag {
		padding: 0.4rem 0.6rem;
		background: var(--black);
		color: var(--lime);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	@media (min-width: 900px) {
		.rounds {
			grid-auto-flow: row;
			grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
			margin: 0;
			padding: 0;
			overflow: visible;
			background: var(--hair);
			border: 1px solid var(--hair);
		}
		li {
			min-height: 12rem;
		}
	}
</style>
