<script lang="ts">
	import SectionHead from './SectionHead.svelte';
	import DriverCard from './DriverCard.svelte';
	import Arrow from './Arrow.svelte';
	import Flag from './Flag.svelte';
	import type { Pilot } from '#lib/content.ts';
	import { countryName } from '#lib/flags.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	// The drivers page. A profile opens over the grid, and /pilotos#<driver id>
	// opens straight onto that driver (the cards on the home page link there).

	let { pilots, year }: { pilots: Pilot[]; year: number } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.drivers);
	const classes = $derived(new Set(pilots.map((p) => p.category)).size);

	let dialog: HTMLDialogElement | undefined = $state();
	let index = $state(0);
	const pilot = $derived(pilots[index] ?? pilots[0]);
	const prev = $derived(pilots[(index - 1 + pilots.length) % pilots.length]);
	const next = $derived(pilots[(index + 1) % pilots.length]);

	function show(i: number) {
		index = (i + pilots.length) % pilots.length;
		if (!dialog?.open) dialog?.showModal();
	}

	$effect(() => {
		const open = () => {
			const i = pilots.findIndex((p) => p.id === decodeURIComponent(location.hash.slice(1)));
			if (i >= 0) show(i);
		};
		open();
		addEventListener('hashchange', open);
		return () => removeEventListener('hashchange', open);
	});
</script>

<section id="drivers" class="drivers">
	<div class="wrap">
		<SectionHead level={1} eyebrow={t.eyebrow(year)} lines={t.title} accent={1}>
			{#if pilots.length}
				<p>{t.intro(pilots.length, classes)}</p>
			{/if}
		</SectionHead>

		{#if pilots.length}
			<ul class="grid" use:inview>
				{#each pilots as p, i (p.id)}
					<li id={p.id} class="rv" style:--d="{(i % 3) * 90}ms">
						<DriverCard {p} onclick={() => show(i)} />
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty">{t.empty}</p>
		{/if}
	</div>
</section>

{#if pilot}
	<dialog
		bind:this={dialog}
		class="sheet {pilot.accent}"
		aria-labelledby="pilot-name"
		onclick={(e) => e.target === dialog && dialog.close()}
	>
		<div class="sheet-in">
			<header class="plate" class:photo={pilot.photo}>
				{#if pilot.photo}
					<img src={pilot.photo} alt="" />
				{/if}
				<span class="big num" aria-hidden="true">{pilot.number}</span>
				<button class="close" onclick={() => dialog?.close()} aria-label={t.close}>
					<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" /></svg>
				</button>
				<div class="plate-who">
					<span class="cat"><Flag code={pilot.country} />#{pilot.number}, {pilot.category}</span>
					<h3 id="pilot-name">
						<span class="first">{pilot.first}</span>
						<span class="last">{pilot.last}</span>
					</h3>
				</div>
			</header>

			<div class="body">
				<dl class="specs">
					<div>
						<dt>{t.country}</dt>
						<dd class="from"><Flag code={pilot.country} />{countryName(pilot.country, i18n.lang)}</dd>
					</div>
					<div><dt>{t.age}</dt><dd>{pilot.age}</dd></div>
					{#if pilot.hometown}
						<div><dt>{t.hometown}</dt><dd>{pilot.hometown}</dd></div>
					{/if}
					<div><dt>{t.since}</dt><dd>{pilot.since}</dd></div>
					{#if pilot.chassis}
						<div><dt>{t.chassis}</dt><dd>{pilot.chassis}</dd></div>
					{/if}
					{#if pilot.engine}
						<div><dt>{t.engine}</dt><dd>{pilot.engine}</dd></div>
					{/if}
				</dl>
			</div>

			{#if pilots.length > 1}
				<footer class="pager">
					<button onclick={() => show(index - 1)}>
						<Arrow dir="left" />
						<span><small>{t.prev}</small>{prev.first} {prev.last}</span>
					</button>
					<button class="nx" onclick={() => show(index + 1)}>
						<span><small>{t.next}</small>{next.first} {next.last}</span>
						<Arrow />
					</button>
				</footer>
			{/if}
		</div>
	</dialog>
{/if}

<style>
	.drivers {
		padding-block: var(--page-top) var(--section);
	}
	.empty {
		padding-block: 2rem 4rem;
		color: var(--fg-2);
	}

	/* Phones: a swipeable row of cards. Wider screens: a grid. */
	.grid {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: min(82%, 22rem);
		gap: 0.75rem;
		margin: 0 calc(var(--gutter) * -1);
		padding: 0 var(--gutter);
		list-style: none;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-snap-type: x mandatory;
		scroll-padding-inline: var(--gutter);
		scrollbar-width: none;
	}
	.grid::-webkit-scrollbar {
		display: none;
	}
	.grid li {
		scroll-snap-align: start;
		/* Clear of the header when the browser scrolls to #<driver id> */
		scroll-margin-top: calc(var(--nav-compact) + 2rem);
	}
	.grid :global(.card) {
		border: 1px solid var(--hair);
	}

	/* ---------- profile sheet ---------- */
	dialog {
		--accent: var(--lime);
		position: fixed;
		inset: 0 0 0 auto;
		width: min(38rem, 100vw);
		max-width: none;
		height: 100dvh;
		max-height: none;
		margin: 0;
		padding: 0;
		border: 0;
		background: var(--bg-1);
		color: var(--fg);
		overflow: hidden;
	}
	dialog.cyan {
		--accent: var(--blue);
	}
	dialog[open] {
		animation: sheet-in 0.7s var(--ease-out);
	}
	dialog::backdrop {
		background: rgb(0 0 0 / 0.6);
		backdrop-filter: blur(6px);
		animation: fade-in 0.5s;
	}
	@keyframes sheet-in {
		from {
			translate: 100% 0;
		}
	}
	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}
	.sheet-in {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.plate {
		position: relative;
		flex-shrink: 0;
		display: flex;
		align-items: flex-end;
		min-height: 20rem;
		padding: 1.75rem;
		overflow: hidden;
		isolation: isolate;
		background: var(--accent);
		color: var(--black);
	}
	.plate.photo img {
		position: absolute;
		inset: 0;
		z-index: -2;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: 50% 20%;
	}
	.plate.photo::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(to top, var(--accent) 12%, transparent 65%);
	}
	.plate.photo .big {
		display: none;
	}
	.plate.photo .plate-who {
		z-index: 1;
	}
	.plate.photo {
		min-height: 26rem;
	}
	.big {
		position: absolute;
		top: -0.02em;
		right: -0.03em;
		font-size: 21rem;
		font-stretch: 62%;
		font-weight: 900;
		letter-spacing: -0.04em;
		line-height: 0.78;
		color: rgb(0 0 0 / 0.12);
	}
	.close {
		position: absolute;
		top: 1.25rem;
		right: 1.25rem;
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 50%;
		background: var(--black);
		color: var(--fg);
		transition: rotate 0.5s var(--ease-out);
	}
	.close:hover {
		rotate: 90deg;
	}
	.close svg {
		width: 0.9rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
	}
	.close:focus-visible {
		outline-color: var(--black);
	}
	.plate-who {
		position: relative;
	}
	.plate .cat {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.plate .cat :global(.flag) {
		font-size: 1rem;
		box-shadow: 0 0 0 1px rgb(0 0 0 / 0.18);
	}
	h3 {
		display: flex;
		flex-direction: column;
		margin-top: 0.75rem;
	}
	h3 .first {
		color: rgb(0 0 0 / 0.6);
		font-size: 1.25rem;
		font-weight: 500;
	}
	h3 .last {
		font-size: clamp(2.75rem, 9vw, 4rem);
		font-weight: 800;
		font-style: italic;
		font-stretch: 125%;
		letter-spacing: -0.03em;
		line-height: 0.95;
		text-transform: uppercase;
	}

	.body {
		flex: 1;
		padding: 2rem 1.75rem;
	}
	.specs dt {
		margin-top: 0.4rem;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.specs {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.specs div {
		padding: 1rem 1rem 1rem 0;
		border-bottom: 1px solid var(--hair);
	}
	/* Nationality, on a row of its own */
	.specs div:first-child {
		grid-column: 1 / -1;
	}
	.specs .from {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.from :global(.flag) {
		font-size: 1.1rem;
	}
	.specs dt {
		margin: 0 0 0.35rem;
	}
	.specs dd {
		font-weight: 500;
	}

	.pager {
		display: grid;
		grid-template-columns: 1fr 1fr;
		border-top: 1px solid var(--hair-2);
	}
	.pager button {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 1.75rem;
		text-align: left;
		font-weight: 600;
		transition: background 0.3s;
	}
	.pager button:hover {
		background: var(--bg-2);
	}
	.pager .nx {
		justify-content: flex-end;
		text-align: right;
		border-left: 1px solid var(--hair);
	}
	.pager :global(svg) {
		flex-shrink: 0;
		width: 1rem;
		color: var(--accent);
	}
	.pager small {
		display: block;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-3);
	}

	@media (min-width: 700px) {
		.grid {
			grid-auto-flow: row;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 1px;
			margin: 0;
			padding: 0;
			overflow: visible;
			background: var(--hair);
			border: 1px solid var(--hair);
		}
		.grid :global(.card) {
			border: 0;
		}
	}
	@media (min-width: 1100px) {
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.grid :global(.card) {
			padding: 1.75rem;
		}
	}
</style>
