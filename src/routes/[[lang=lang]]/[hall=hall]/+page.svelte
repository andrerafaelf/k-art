<script lang="ts">
	import { page } from '$app/state';
	import Kerb from '#lib/components/Kerb.svelte';
	import HallSeason from '#lib/components/HallSeason.svelte';
	import HallDriver from '#lib/components/HallDriver.svelte';
	import Trophy from '#lib/components/Trophy.svelte';
	import { byYear, hallTotals } from '#lib/content.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { inview, countup } from '#lib/motion.ts';

	let { data } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.hall);
	const seasons = $derived(byYear(data.history));
	const totals = $derived(hallTotals(data.history, data.alumni));
	const counters = $derived([
		{ v: totals.seasons, l: t.totals.seasons },
		{ v: totals.titles, l: t.totals.titles, hot: true },
		{ v: totals.wins, l: t.totals.wins },
		{ v: totals.podiums, l: t.totals.podiums },
		{ v: totals.alumni, l: t.totals.alumni }
	]);
</script>

<svelte:head>
	<title>{t.metaTitle}</title>
	<meta name="description" content={t.metaDescription} />
	<meta property="og:title" content={t.metaTitle} />
	<meta property="og:description" content={t.metaDescription} />
	<meta property="og:image" content="{page.url.origin}/og.png" />
</svelte:head>

<main id="hall">
	<header class="top">
		<div class="wrap">
			<div class="cup" aria-hidden="true"><Trophy /></div>
			<p class="eyebrow">{t.eyebrow}</p>
			<h1 class="display">
				{#each t.title as line, i}
					<span class="line"><span class:accent={i === 1} style:--d="{0.1 + i * 0.09}s">{line}</span></span>
				{/each}
			</h1>
			<p class="lead">{t.intro}</p>

			<dl class="totals">
				{#each counters as c}
					<div class:hot={c.hot}>
						<dt>{c.l}</dt>
						<dd class="mono"><span use:countup={c.v}>{c.v}</span></dd>
					</div>
				{/each}
			</dl>
		</div>
	</header>

	<Kerb />

	<section class="block">
		<div class="wrap">
			<div class="block-head">
				<p class="eyebrow"><b>{seasons.length}</b> · {t.seasons}</p>
				<p class="sub">{t.seasonsIntro}</p>
			</div>
			{#if seasons.length}
				<ol class="seasons" use:inview>
					{#each seasons as s, i (s.id)}
						<li class="rv" style:--d="{Math.min(i, 3) * 80}ms"><HallSeason {s} variant="full" /></li>
					{/each}
				</ol>
			{:else}
				<p class="empty">{t.empty}</p>
			{/if}
		</div>
	</section>

	{#if data.alumni.length}
		<section class="block alumni">
			<div class="wrap">
				<div class="block-head">
					<p class="eyebrow"><b>{data.alumni.length}</b> · {t.drivers}</p>
					<p class="sub">{t.driversIntro}</p>
				</div>
				<ul class="plaques" use:inview>
					{#each data.alumni as a, i (a.id)}
						<li class="rv" style:--d="{(i % 3) * 80}ms"><HallDriver {a} /></li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}
</main>

<style>
	.top {
		position: relative;
		overflow: hidden;
		padding: calc(var(--nav-h) + clamp(3rem, 8vw, 6rem)) 0 clamp(3rem, 6vw, 4.5rem);
		background:
			radial-gradient(50% 70% at 85% 30%, rgb(214 249 6 / 0.1), transparent 70%),
			radial-gradient(40% 60% at 100% 100%, rgb(68 184 243 / 0.08), transparent 70%),
			var(--bg);
	}
	/* A huge trophy outline in the background */
	.cup {
		position: absolute;
		z-index: 0;
		right: -4%;
		top: 8%;
		width: min(48vw, 40rem);
		color: rgb(214 249 6 / 0.12);
		pointer-events: none;
		/* Fades out before it reaches the stats row */
		mask-image: linear-gradient(#000 45%, transparent 72%);
		animation: fade 1.6s var(--ease-out) both;
	}
	.cup :global(svg path) {
		stroke-width: 0.35;
	}
	.top .wrap {
		position: relative;
	}
	h1 {
		margin-top: 1.5rem;
		font-size: var(--t-page);
	}
	h1 .line > span {
		animation: rise 1.1s var(--ease-out) both;
		animation-delay: var(--d);
	}
	@keyframes rise {
		from {
			translate: -0.4em 140%;
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
			translate: 0 2rem;
		}
	}
	.lead {
		max-width: 34rem;
		margin-top: 2rem;
		animation: fade 1.2s var(--ease-out) 0.3s both;
	}

	.totals {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		margin: clamp(3rem, 6vw, 4.5rem) 0 0;
		border-top: 1px solid var(--hair-2);
		animation: fade 1.2s var(--ease-out) 0.45s both;
	}
	.totals div {
		display: flex;
		flex-direction: column-reverse;
		gap: 0.5rem;
		padding: 1.25rem 1rem 1.25rem 0;
		border-bottom: 1px solid var(--hair);
	}
	.totals div:nth-child(even) {
		padding-left: 1rem;
		border-left: 1px solid var(--hair);
	}
	dt {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	dd {
		font-size: var(--t-figure);
		font-weight: 600;
		line-height: 1;
	}
	.hot dd {
		color: var(--lime);
	}

	.block {
		padding-block: clamp(4rem, 8vw, 7rem);
	}
	.alumni {
		padding-top: 0;
	}
	.block-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem 2rem;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--hair-2);
	}
	.sub {
		color: var(--fg-2);
	}
	.seasons {
		display: grid;
		gap: 1.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.plaques {
		display: grid;
		gap: 1rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.empty {
		padding-block: 3rem;
		color: var(--fg-2);
	}

	@media (min-width: 700px) {
		.plaques {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (min-width: 1000px) {
		.totals {
			grid-template-columns: repeat(5, 1fr);
		}
		.totals div,
		.totals div:nth-child(even) {
			padding: 1.5rem 1.5rem 0.5rem;
			border-bottom: 0;
			border-left: 1px solid var(--hair);
		}
		.totals div:first-child {
			padding-left: 0;
			border-left: 0;
		}
		.plaques {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
