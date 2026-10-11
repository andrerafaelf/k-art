<script module lang="ts">
	// The start sequence plays on the first visit to the home page. Coming back to
	// it later in the same visit shows it settled, without the lights.
	let played = false;
</script>

<script lang="ts">
	import { browser } from '$app/env';
	import Arrow from './Arrow.svelte';
	import Flag from './Flag.svelte';
	import { numbered, nextRound, shortDate, tr, code3, driverSeason } from '#lib/content.ts';
	import type { Pilot, Round, Settings } from '#lib/content.ts';
	import { countryName } from '#lib/flags.ts';
	import { useI18n, pagePath } from '#lib/i18n.ts';

	interface Props {
		pilots: Pilot[];
		season: Round[];
		settings: Settings;
	}

	let { pilots, season, settings }: Props = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t);

	const still = browser && played;
	$effect(() => {
		played = true;
	});

	let now = $state(Date.now());
	$effect(() => {
		now = Date.now();
		const id = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(id);
	});

	const rounds = $derived(numbered(season));
	const next = $derived(nextRound(rounds, now));
	const lines = $derived(tr(settings.heroLines, i18n.lang).filter((l) => l.trim()));

	// Timing tower: the line-up ranked by this season's results from the
	// calendar, wins first, then podiums, then best finish; drivers level stay in
	// line-up order. The rows fill in one by one, top down, when the lights go out.
	const ranked = $derived(
		pilots
			.map((p) => ({ ...p, season: driverSeason(season, p.id) }))
			.sort(
				(a, b) =>
					b.season.wins - a.season.wins ||
					b.season.podiums - a.season.podiums ||
					(a.season.best ?? 99) - (b.season.best ?? 99)
			)
	);

	const pad = (n: number) => String(n).padStart(2, '0');
	const countdown = $derived.by(() => {
		if (!next) return undefined;
		const s = Math.max(0, Math.floor((new Date(next.date).getTime() - now) / 1000));
		return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
	});

</script>

<section id="top" class="hero" class:still>
	<div class="wrap content">
		<div class="copy">
			<div class="start">
				<div class="lights" aria-hidden="true">
					{#each [0, 1, 2, 3, 4] as i}
						<span class="pod" style:--i={i}><i></i><i></i></span>
					{/each}
				</div>
				<p class="eyebrow fade" style:--d="1.1s">{tr(settings.heroEyebrow, i18n.lang)}</p>
			</div>

			<h1 class="display">
				{#each lines as line, i}
					<span class="line"
						><span class:accent={i === lines.length - 1} style:--d="{1.08 + i * 0.07}s"
							>{line}</span
						></span
					>
				{/each}
			</h1>

			<div class="below fade" style:--d="1.4s">
				<p class="lead">{tr(settings.heroLead, i18n.lang)}</p>
				<div class="actions">
					{#if pilots.length}
						<a class="btn" href={pagePath('drivers', i18n.lang)}>{t.hero.meet} <Arrow /></a>
					{/if}
					{#if season.length}
						<a class="btn btn-ghost" href={pagePath('season', i18n.lang)}>{t.hero.season(settings.seasonYear)}</a>
					{/if}
				</div>
			</div>
		</div>

		<aside class="pitwall fade" style:--d="0.3s">
			{#if next && countdown}
				<a class="next striped" href={pagePath('season', i18n.lang)}>
					<span class="label mono">
						<b></b>{t.hero.lightsIn}
						<span class="where">{next.location} · {shortDate(next.date, i18n.lang)}</span>
					</span>
					<span class="clock mono" role="timer">
						{#each countdown as v, i}
							<span><b>{pad(v)}</b><small>{t.hero.units[i]}</small></span>
						{/each}
					</span>
				</a>
			{/if}

			{#if ranked.length}
				<div class="tower striped" role="table" aria-label="{t.hero.tower(settings.seasonYear)}, {t.hero.towerSub}">
					<div class="tower-head mono" role="row">
						<span role="columnheader">{t.hero.tower(settings.seasonYear)}</span>
						<span role="columnheader">{t.hero.towerSub}</span>
					</div>
					<div class="tower-body" style:--n={ranked.length}>
						<ol class="pos mono" aria-hidden="true">
							{#each ranked as _, i}
								<li class:p1={i === 0}>{i + 1}</li>
							{/each}
						</ol>
						<ol class="rows">
							{#each ranked as p, i (p.id)}
								<li
									class="row {p.accent}"
									class:p1={i === 0}
									class:lead={i === 0 && p.season.wins > 0}
									style:--i={i}
									role="row"
								>
									<span class="plate num">{p.number}</span>
									<span class="who" role="cell">
										<Flag code={p.country} alt={countryName(p.country, i18n.lang)} />
										<b>{code3(p.last)}</b>
										<small class="mono">{p.first} {p.last}</small>
									</span>
									<span class="cat mono" role="cell">{p.category}</span>
									<span class="wins mono" role="cell">{p.season.wins}</span>
								</li>
							{/each}
						</ol>
					</div>
				</div>
			{/if}
		</aside>
	</div>

</section>

<style>
	.hero {
		--go: 1.05s;
		position: relative;
		display: grid;
		grid-template-rows: 1fr;
		min-height: clamp(46rem, 100svh, 66rem);
		padding-top: calc(var(--nav-h) + env(safe-area-inset-top, 0px));
		overflow: hidden;
	}
	.hero::after {
		content: '';
		position: absolute;
		z-index: -1;
		top: -10%;
		right: -15%;
		width: 70vw;
		aspect-ratio: 1;
		background: radial-gradient(closest-side, rgb(68 184 243 / 0.12), transparent 70%);
		pointer-events: none;
	}

	/* ---------- layout ---------- */
	.content {
		align-self: center;
		display: grid;
		gap: 3rem;
		padding-block: 2.5rem 3rem;
	}

	/* ---------- start lights ---------- */
	.start {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.75rem;
	}
	.lights {
		display: flex;
		gap: 0.3rem;
		padding: 0.35rem;
		background: #0d0e10;
		box-shadow: inset 0 0 0 1px var(--hair-2);
		clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
	}
	.pod {
		display: grid;
		gap: 0.25rem;
		padding: 0.25rem;
		border-radius: 0.3rem;
		background: #16171a;
	}
	.pod i {
		width: 0.8rem;
		height: 0.8rem;
		border-radius: 50%;
		background: #2a1313;
		box-shadow: inset 0 -2px 3px rgb(0 0 0 / 0.5);
		--on: calc(0.15s + var(--i) * 0.16s);
		animation: lamp calc(var(--go) - var(--on)) linear forwards;
		animation-delay: var(--on);
	}
	@keyframes lamp {
		0%,
		99% {
			background: var(--red);
			box-shadow:
				0 0 12px 2px rgb(255 45 45 / 0.75),
				inset 0 -2px 3px rgb(120 0 0 / 0.6);
		}
		100% {
			background: #2a1313;
		}
	}
	.eyebrow {
		margin: 0;
	}

	/* ---------- headline ---------- */
	h1 {
		font-size: clamp(2.75rem, 12vw, 6.5rem);
	}
	h1 .line > span {
		animation: rise 1.1s var(--ease-out) both;
		animation-delay: var(--d);
	}
	@keyframes rise {
		from {
			translate: -0.4em 140%;
			skew: -12deg 0deg;
		}
	}

	.below {
		display: grid;
		gap: 2rem;
		margin-top: clamp(1.75rem, 3vw, 2.5rem);
	}
	.lead {
		max-width: 30rem;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	/* ---------- pit wall: countdown and timing tower ---------- */
	.pitwall {
		display: grid;
		gap: 0.75rem;
		align-content: center;
	}
	.next {
		display: grid;
		gap: 0.9rem;
		padding: 1.1rem 1.25rem 1.2rem;
		background: linear-gradient(135deg, rgb(214 249 6 / 0.1), rgb(214 249 6 / 0.02) 60%), rgb(12 13 15 / 0.85);
		box-shadow: inset 0 0 0 1px rgb(214 249 6 / 0.25);
		backdrop-filter: blur(10px);
		transition: box-shadow 0.3s;
	}
	.next:hover {
		box-shadow: inset 0 0 0 1px rgb(214 249 6 / 0.6);
	}
	.label {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.75rem;
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-2);
	}
	.label b {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: var(--lime);
		box-shadow: 0 0 10px var(--lime);
		animation: blink 1.6s steps(1) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0.3;
		}
	}
	.where {
		margin-left: auto;
		color: var(--fg);
	}
	.clock {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
	}
	.clock span {
		display: flex;
		align-items: baseline;
		gap: 0.2rem;
	}
	.clock span + span {
		padding-left: 0.9rem;
		border-left: 1px solid var(--hair-2);
	}
	.clock b {
		font-size: clamp(1.9rem, 4vw, 2.6rem);
		font-weight: 600;
		line-height: 1;
		color: var(--fg);
	}
	.clock small {
		font-size: 0.75rem;
		color: var(--lime);
	}

	.tower {
		--row: 3.4rem;
		background: rgb(12 13 15 / 0.88);
		box-shadow: inset 0 0 0 1px var(--hair-2);
		backdrop-filter: blur(10px);
	}
	.tower-head {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.85rem 1.25rem;
		border-bottom: 1px solid var(--hair-2);
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-2);
	}
	.tower-head span:first-child {
		color: var(--fg);
	}
	.tower-body {
		display: grid;
		grid-template-columns: 3rem 1fr;
		padding-bottom: 0.4rem;
	}
	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.pos li {
		display: grid;
		place-items: center;
		height: var(--row);
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--fg-2);
	}
	.pos li.p1 {
		color: var(--black);
		background: var(--lime);
		clip-path: polygon(0 0, 100% 0, 78% 100%, 0 100%);
	}
	.rows {
		overflow: hidden;
	}
	.row {
		--accent: var(--lime);
		position: relative;
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto auto;
		align-items: center;
		gap: 0.9rem;
		height: var(--row);
		padding: 0 1.25rem 0 0.75rem;
		border-bottom: 1px solid var(--hair);
		animation: fill 0.8s var(--ease-out) both;
		animation-delay: calc(var(--go) + 0.1s + var(--i) * 90ms);
	}
	.row.cyan {
		--accent: var(--blue);
	}
	/* Team colour bar */
	.row::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.7rem;
		bottom: 0.7rem;
		width: 3px;
		background: var(--accent);
	}
	/* Sweep of light as each row settles into place */
	.row::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.12), transparent);
		translate: -100% 0;
		animation: sweep 0.9s var(--ease-out) both;
		animation-delay: calc(var(--go) + 0.5s + var(--i) * 90ms);
		pointer-events: none;
	}
	/* Wiped in from the left, like a timing screen filling in */
	@keyframes fill {
		from {
			clip-path: inset(0 100% 0 0);
			translate: -0.75rem 0;
		}
		to {
			clip-path: inset(0);
		}
	}
	@keyframes sweep {
		to {
			translate: 100% 0;
		}
	}
	.plate {
		display: grid;
		place-items: center;
		min-width: 2.4rem;
		height: 1.9rem;
		padding-inline: 0.3rem;
		background: var(--plate);
		color: var(--black);
		font-size: 1.25rem;
		clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);
	}
	.who {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		min-width: 0;
	}
	.who :global(.flag) {
		align-self: center;
		margin-right: -0.2rem;
		font-size: 0.85rem;
	}
	.who b {
		font-size: 1.15rem;
		font-style: italic;
		font-stretch: 125%;
		font-weight: 900;
		letter-spacing: 0.02em;
	}
	.who small {
		overflow: hidden;
		font-size: 0.72rem;
		color: var(--fg-3);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.cat {
		display: none;
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.wins {
		min-width: 2ch;
		font-size: 1.15rem;
		font-weight: 700;
		text-align: right;
	}
	/* Most wins this season, in timing-screen purple */
	.row.lead .wins {
		color: var(--purple);
		text-shadow: 0 0 14px rgb(181 77 255 / 0.6);
	}

	.fade {
		animation: fade 1.2s var(--ease-out) both;
		animation-delay: var(--d);
	}
	@keyframes fade {
		from {
			opacity: 0;
			translate: 0 16px;
		}
	}

	@media (min-width: 720px) {
		.start {
			flex-direction: row;
			align-items: center;
			gap: 1.25rem;
		}
		.cat {
			display: block;
		}
	}

	@media (min-width: 1100px) {
		.content {
			grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
			align-items: center;
			gap: 4rem;
			padding-block: 2rem;
		}
		h1 {
			font-size: var(--t-hero);
		}
	}

	.still .pod i,
	.still .fade,
	.still h1 .line > span,
	.still .row,
	.still .row::after {
		animation: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.pod i {
			animation: none;
		}
	}
</style>
