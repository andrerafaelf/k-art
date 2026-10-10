<script lang="ts">
	import Arrow from './Arrow.svelte';
	import type { Pilot } from '#lib/content.ts';
	import { useI18n } from '#lib/i18n.ts';

	// A driver on the grid: the race number outlined behind, the name in front.
	// A button that opens the profile on the drivers page, a link to it elsewhere.
	interface Props {
		p: Pilot;
		/** Link to the profile; without it the card is a button */
		href?: string;
		onclick?: () => void;
		/** Smaller, for the row on the home page */
		compact?: boolean;
	}

	let { p, href, onclick, compact = false }: Props = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.drivers);
	const label = $derived(t.open(`${p.first} ${p.last}`, p.category, p.number));
</script>

{#snippet inside()}
	<span class="no num" aria-hidden="true">{p.number}</span>
	{#if p.photo}
		<img src={p.photo} alt="" loading="lazy" />
	{/if}
	<span class="top">
		<span class="cat">{p.category}</span>
	</span>
	<span class="who">
		<span class="first">{p.first}</span>
		<span class="last">{p.last}</span>
	</span>
	<span class="meta">
		<span><b class="num">{p.record.wins}</b>{t.wins}</span>
		<span><b class="num">{p.record.podiums}</b>{t.podiums}</span>
		{#if !compact}
			<span><b class="num">{p.record.poles}</b>{t.poles}</span>
		{/if}
		<span class="go"><Arrow /></span>
	</span>
{/snippet}

{#if href}
	<a {href} class="card {p.accent}" class:compact aria-label={label}>{@render inside()}</a>
{:else}
	<button {onclick} class="card {p.accent}" class:compact aria-haspopup="dialog" aria-label={label}>{@render inside()}</button>
{/if}

<style>
	.card {
		--accent: var(--lime);
		position: relative;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		width: 100%;
		aspect-ratio: 4 / 4.3;
		min-height: 24rem;
		padding: 1.5rem;
		overflow: hidden;
		text-align: left;
		background: var(--bg-1);
		transition: background 0.6s var(--ease-out);
	}
	.card.cyan {
		--accent: var(--blue);
	}
	.card:has(img)::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -2;
		background: linear-gradient(to top, rgb(14 15 17 / 0.95) 25%, transparent 70%);
	}
	.card:hover {
		background: var(--bg-2);
	}

	.no {
		position: absolute;
		z-index: -1;
		top: -0.09em;
		right: -0.08em;
		font-size: clamp(12.5rem, 22vw, 18.5rem);
		font-stretch: 62%;
		font-weight: 900;
		letter-spacing: -0.04em;
		line-height: 0.78;
		color: transparent;
		-webkit-text-stroke: 1.5px var(--accent);
		/* Fills from the bottom up on hover */
		background: linear-gradient(var(--accent), var(--accent)) 0 100% / 100% 0% no-repeat;
		-webkit-background-clip: text;
		background-clip: text;
		transition:
			background-size 0.8s var(--ease-out),
			translate 0.9s var(--ease-out);
	}
	.card:hover .no,
	.card:focus-visible .no {
		background-size: 100% 100%;
		translate: -0.02em 0.02em;
	}
	.card img {
		position: absolute;
		inset: 0;
		z-index: -3;
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* Keep the face in frame when the card is wider than the photo */
		object-position: 50% 22%;
		transition:
			filter 0.9s var(--ease-out),
			scale 1.4s var(--ease-out);
	}
	/* Photo cards: on hover the number cuts in over the portrait, screened so the photo
	   still reads through */
	.card:has(img) .no {
		color: var(--accent);
		-webkit-text-stroke: 0;
		background: none;
		mix-blend-mode: screen;
		translate: 0.04em 0;
		clip-path: polygon(0 -0.2em, 0 -0.2em, -0.25em 1em, -0.25em 1em);
		transition:
			clip-path 0.8s var(--ease-out) 0.06s,
			translate 1s var(--ease-out);
	}
	.card:has(img):hover .no,
	.card:has(img):focus-visible .no {
		translate: 0 0;
		clip-path: polygon(0 -0.2em, calc(100% + 0.5em) -0.2em, calc(100% + 0.25em) 1em, -0.25em 1em);
	}
	.card:hover img,
	.card:focus-visible img {
		scale: 1.04;
		filter: brightness(0.82);
	}

	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.cat {
		padding: 0.4rem 0.6rem;
		background: rgb(8 9 10 / 0.75);
		backdrop-filter: blur(8px);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.go {
		margin-left: auto;
		align-self: center;
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		background: var(--bg);
		color: var(--fg);
		transition:
			background 0.4s var(--ease-out),
			color 0.4s;
	}
	.go :global(svg) {
		width: 0.9rem;
		transition: rotate 0.5s var(--ease-out);
	}
	.card:hover .go {
		background: var(--accent);
		color: var(--black);
	}
	.card:hover .go :global(svg) {
		rotate: -45deg;
	}

	.who {
		display: flex;
		flex-direction: column;
		margin-top: auto;
	}
	.first {
		font-size: 1.0625rem;
		color: var(--fg-2);
	}
	.last {
		font-size: clamp(2rem, 3vw, 2.6rem);
		font-weight: 800;
		font-style: italic;
		font-stretch: 125%;
		letter-spacing: -0.03em;
		line-height: 0.95;
		text-transform: uppercase;
	}
	.meta {
		display: flex;
		gap: 1.5rem;
		margin-top: 1.25rem;
		padding-top: 1rem;
		border-top: 1px solid var(--hair-2);
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.meta b {
		display: block;
		margin-bottom: 0.3rem;
		font-size: 1.75rem;
		color: var(--fg);
		letter-spacing: 0;
	}

	/* ---------- compact ---------- */
	/* Shorter, with the number and name sized from the card's own width so long
	   names still fit. The home page sets it wider than tall on large screens. */
	.compact {
		container-type: inline-size;
		aspect-ratio: 3 / 4;
		min-height: 18rem;
		padding: 1.25rem;
	}
	.compact .no {
		font-size: clamp(9rem, 50cqi, 14rem);
	}
	.compact .last {
		font-size: clamp(1.5rem, 9cqi, 2.25rem);
	}
	.compact .meta {
		gap: 1.25rem;
		margin-top: 1rem;
		padding-top: 0.85rem;
		font-size: 0.7rem;
	}
	.compact .meta b {
		font-size: 1.5rem;
	}
</style>
