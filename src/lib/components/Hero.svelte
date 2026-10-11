<script module lang="ts">
	// The start sequence plays on the first visit to the home page. Coming back to
	// it later in the same visit shows it settled, without the lights.
	let played = false;
</script>

<script lang="ts">
	import { browser } from '$app/env';
	import Arrow from './Arrow.svelte';
	import { numbered, nextRound, shortRange } from '#lib/content.ts';
	import type { Round, Settings } from '#lib/content.ts';
	import { useI18n, pagePath } from '#lib/i18n.ts';

	// The headline in the middle, under the start lights, and the countdown to the
	// next race along the bottom like a broadcast caption.

	interface Props {
		/** Whether there are drivers to meet */
		drivers: boolean;
		season: Round[];
		settings: Settings;
	}

	let { drivers, season, settings }: Props = $props();

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
	const lines = $derived(i18n.lines('home.title'));

	const pad = (n: number) => String(n).padStart(2, '0');
	const countdown = $derived.by(() => {
		if (!next) return undefined;
		const s = Math.max(0, Math.floor((new Date(next.date).getTime() - now) / 1000));
		return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
	});
</script>

<section id="top" class="hero" class:still>
	<div class="wrap content">
		<div class="lights" aria-hidden="true">
			{#each [0, 1, 2, 3, 4] as i}
				<span class="pod" style:--i={i}><i></i><i></i></span>
			{/each}
		</div>
		<p class="eyebrow fade" style:--d="1.1s">{i18n.text('home.eyebrow')}</p>

		<h1 class="display">
			{#each lines as line, i}
				<span class="line"
					><span class:accent={i === lines.length - 1} style:--d="{1.08 + i * 0.07}s">{line}</span></span
				>
			{/each}
		</h1>

		<p class="lead fade" style:--d="1.4s">{i18n.text('home.lead')}</p>
		<div class="actions fade" style:--d="1.5s">
			{#if drivers}
				<a class="btn" href={pagePath('drivers', i18n.lang)}>{t.hero.meet} <Arrow /></a>
			{/if}
			{#if season.length}
				<a class="btn btn-ghost" href={pagePath('season', i18n.lang)}>{t.hero.season(settings.seasonYear)}</a>
			{/if}
		</div>
	</div>

	{#if next && countdown}
		<div class="wrap strip">
			<a class="next striped fade" style:--d="0.3s" href={pagePath('season', i18n.lang)}>
				<span class="info">
					<span class="label mono"><b></b>{t.hero.lightsIn}</span>
					<span class="place">{next.location}</span>
					<span class="when mono">{shortRange(next, i18n.lang)} · {t.hero.round(next.round, rounds.length)}</span>
				</span>
				<span class="clock mono" role="timer">
					{#each countdown as v, i}
						<span><b>{pad(v)}</b><small>{t.hero.units[i]}</small></span>
					{/each}
				</span>
				<span class="go" aria-hidden="true"><Arrow /></span>
			</a>
		</div>
	{/if}
</section>

<style>
	.hero {
		--go: 1.05s;
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-rows: 1fr auto;
		min-height: clamp(40rem, 100svh, 62rem);
		padding: calc(var(--nav-h) + env(safe-area-inset-top, 0px)) 0 clamp(1.5rem, 3vw, 2.5rem);
		overflow: hidden;
	}
	/* A wash of team blue from above, behind the headline */
	.hero::after {
		content: '';
		position: absolute;
		z-index: -1;
		top: -45%;
		left: 50%;
		width: min(120vw, 90rem);
		aspect-ratio: 1;
		translate: -50% 0;
		background: radial-gradient(closest-side, rgb(68 184 243 / 0.13), transparent 72%);
		pointer-events: none;
	}

	/* ---------- headline ---------- */
	.content {
		align-self: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-block: clamp(2.5rem, 6vh, 4.5rem);
		text-align: center;
	}

	/* The start gantry: five pairs of lights come on one by one, then go out together */
	.lights {
		display: flex;
		gap: 0.35rem;
		margin-bottom: 1.5rem;
		padding: 0.4rem;
		background: #0d0e10;
		box-shadow: inset 0 0 0 1px var(--hair-2);
		clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
	}
	.pod {
		display: grid;
		gap: 0.3rem;
		padding: 0.3rem;
		border-radius: 0.35rem;
		background: #16171a;
	}
	.pod i {
		width: 0.95rem;
		height: 0.95rem;
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

	h1 {
		margin-top: 1.6rem;
		font-size: var(--t-hero);
	}
	h1 .line > span {
		animation: rise 1.1s var(--ease-out) both;
		animation-delay: var(--d);
	}
	@keyframes rise {
		from {
			translate: 0 140%;
			skew: -12deg 0deg;
		}
	}
	.lead {
		max-width: 36rem;
		margin-top: clamp(1.5rem, 3vw, 2rem);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
		margin-top: clamp(1.75rem, 3vw, 2.25rem);
	}

	/* ---------- next race, along the bottom ---------- */
	.next {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 1rem 2rem;
		padding: 1.1rem 1.25rem 1.2rem;
		background: linear-gradient(135deg, rgb(214 249 6 / 0.08), rgb(214 249 6 / 0.02) 60%), rgb(12 13 15 / 0.85);
		box-shadow: inset 0 0 0 1px rgb(214 249 6 / 0.22);
		backdrop-filter: blur(10px);
		transition: box-shadow 0.3s;
	}
	.next:hover {
		box-shadow: inset 0 0 0 1px rgb(214 249 6 / 0.55);
	}
	.info {
		display: grid;
		gap: 0.35rem;
		min-width: 0;
	}
	.label {
		display: flex;
		align-items: center;
		gap: 0.6rem;
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
	.place {
		font-size: var(--t-card);
		font-style: italic;
		font-weight: 900;
		font-stretch: 125%;
		letter-spacing: -0.02em;
		line-height: 1;
		text-transform: uppercase;
	}
	.when {
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-2);
	}
	.clock {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: repeat(4, auto);
		justify-content: start;
	}
	.clock span {
		display: flex;
		align-items: baseline;
		gap: 0.2rem;
		padding-right: 0.9rem;
	}
	.clock span + span {
		padding-left: 0.9rem;
		border-left: 1px solid var(--hair-2);
	}
	.clock b {
		font-size: clamp(1.75rem, 3vw, 2.5rem);
		font-weight: 600;
		line-height: 1;
	}
	.clock small {
		font-size: 0.75rem;
		color: var(--lime);
	}
	.go {
		display: none;
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

	@media (min-width: 760px) {
		.next {
			grid-template-columns: minmax(0, 1fr) auto auto;
			padding: 1.15rem 1.5rem;
		}
		.clock {
			grid-column: auto;
		}
		.go {
			display: grid;
			place-items: center;
			width: 2.75rem;
			height: 2.75rem;
			border-radius: 50%;
			background: var(--lime);
			color: var(--black);
			transition: rotate 0.5s var(--ease-out);
		}
		.go :global(svg) {
			width: 1rem;
		}
		.next:hover .go {
			rotate: -45deg;
		}
	}

	.still .pod i,
	.still .fade,
	.still h1 .line > span {
		animation: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.pod i {
			animation: none;
		}
	}
</style>
