<script lang="ts">
	import SectionHead from './SectionHead.svelte';
	import HallSeason from './HallSeason.svelte';
	import HallDriver from './HallDriver.svelte';
	import Arrow from './Arrow.svelte';
	import { byYear, hallTotals, type Alumnus, type SeasonArchive } from '#lib/content.ts';
	import { useI18n, hallPath } from '#lib/i18n.ts';
	import { inview, countup } from '#lib/motion.ts';

	let { history, alumni, index }: { history: SeasonArchive[]; alumni: Alumnus[]; index: string } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.hall);
	const seasons = $derived(byYear(history).slice(0, 3));
	const totals = $derived(hallTotals(history, alumni));
	const counters = $derived([
		{ v: totals.seasons, l: t.totals.seasons },
		{ v: totals.titles, l: t.totals.titles, hot: true },
		{ v: totals.wins, l: t.totals.wins },
		{ v: totals.podiums, l: t.totals.podiums },
		{ v: totals.alumni, l: t.totals.alumni }
	]);
</script>

<section id="hall" class="hall">
	<div class="wrap">
		<SectionHead {index} eyebrow={t.eyebrow} lines={t.title} accent={1}>
			<p>{t.intro}</p>
			<a class="btn enter" href={hallPath(i18n.lang)}>{t.enter} <Arrow /></a>
		</SectionHead>

		<dl class="totals" use:inview>
			{#each counters as c, i}
				<div class="rv" class:hot={c.hot} style:--d="{i * 70}ms">
					<dt class="mono">{c.l}</dt>
					<dd class="mono"><span use:countup={c.v}>{c.v}</span></dd>
				</div>
			{/each}
		</dl>

		{#if seasons.length}
			<div class="seasons" use:inview>
				{#each seasons as s, i (s.id)}
					<a class="rv" style:--d="{i * 90}ms" href={hallPath(i18n.lang)}><HallSeason {s} /></a>
				{/each}
			</div>
		{:else}
			<p class="empty mono">{t.empty}</p>
		{/if}

		{#if alumni.length}
			<div class="alumni" use:inview>
				<p class="eyebrow rv">{t.drivers}</p>
				<ul>
					{#each alumni.slice(0, 4) as a, i (a.id)}
						<li class="rv" style:--d="{i * 70}ms"><HallDriver {a} compact /></li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</section>

<style>
	.hall {
		position: relative;
		padding-block: var(--section);
		background:
			radial-gradient(60% 40% at 15% 0%, rgb(214 249 6 / 0.07), transparent 70%),
			radial-gradient(50% 40% at 100% 30%, rgb(33 187 237 / 0.06), transparent 70%),
			var(--bg);
		border-top: 1px solid var(--hair);
	}
	.enter {
		margin-top: 1.75rem;
	}

	.totals {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		margin: 0 0 clamp(2.5rem, 5vw, 4rem);
		border-block: 1px solid var(--hair-2);
	}
	.totals div {
		display: flex;
		flex-direction: column-reverse;
		gap: 0.5rem;
		padding: 1.25rem 1rem 1.4rem 0;
		border-bottom: 1px solid var(--hair);
	}
	.totals div:nth-child(even) {
		padding-left: 1rem;
		border-left: 1px solid var(--hair);
	}
	dt {
		font-size: 0.66rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	dd {
		font-size: clamp(2.25rem, 4.5vw, 3.75rem);
		font-weight: 600;
		line-height: 1;
	}
	.hot dd {
		color: var(--lime);
		text-shadow: 0 0 30px rgb(214 249 6 / 0.35);
	}

	.seasons {
		display: grid;
		gap: 1rem;
	}
	.seasons a {
		display: block;
		height: 100%;
	}
	.empty {
		padding: 3rem 0;
		color: var(--fg-2);
	}

	.alumni {
		margin-top: clamp(3rem, 6vw, 5rem);
	}
	.alumni ul {
		display: grid;
		gap: 1rem;
		margin: 1.5rem 0 0;
		padding: 0;
		list-style: none;
	}

	@media (min-width: 700px) {
		.seasons,
		.alumni ul {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (min-width: 1000px) {
		.totals {
			grid-template-columns: repeat(5, 1fr);
		}
		.totals div,
		.totals div:nth-child(even) {
			padding: 1.5rem 1.5rem 1.75rem;
			border-bottom: 0;
			border-left: 1px solid var(--hair);
		}
		.totals div:first-child {
			padding-left: 0;
			border-left: 0;
		}
		.seasons {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.alumni ul {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
