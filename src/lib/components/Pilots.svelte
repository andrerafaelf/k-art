<script lang="ts">
	import SectionHead from './SectionHead.svelte';
	import Arrow from './Arrow.svelte';
	import { tr, type Pilot } from '#lib/content.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

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
</script>

<section id="drivers" class="drivers">
	<div class="wrap">
		<SectionHead index="S2" eyebrow={t.eyebrow(year)} lines={t.title} accent={1}>
			<p>{t.intro(pilots.length, classes)}</p>
		</SectionHead>

		<ul class="grid" use:inview>
			{#each pilots as p, i (p.id)}
				<li class="rv" style:--d="{(i % 3) * 90}ms">
					<button
						class="card {p.accent}"
						onclick={() => show(i)}
						aria-haspopup="dialog"
						aria-label={t.open(`${p.first} ${p.last}`, p.category, p.number)}
					>
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
							<span><b class="num">{p.record.poles}</b>{t.poles}</span>
							<span class="go"><Arrow /></span>
						</span>
					</button>
				</li>
			{/each}
		</ul>
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
					<span class="cat">#{pilot.number}, {pilot.category}</span>
					<h3 id="pilot-name">
						<span class="first">{pilot.first}</span>
						<span class="last">{pilot.last}</span>
					</h3>
				</div>
			</header>

			<div class="body">
				{#if tr(pilot.quote, i18n.lang)}
					<blockquote>“{tr(pilot.quote, i18n.lang)}”</blockquote>
				{/if}

				<dl class="record">
					<div><dt>{t.starts}</dt><dd class="num">{pilot.record.starts}</dd></div>
					<div><dt>{t.wins}</dt><dd class="num">{pilot.record.wins}</dd></div>
					<div><dt>{t.podiums}</dt><dd class="num">{pilot.record.podiums}</dd></div>
					<div><dt>{t.poles}</dt><dd class="num">{pilot.record.poles}</dd></div>
				</dl>

				<dl class="specs">
					{#if tr(pilot.best, i18n.lang)}
						<div><dt>{t.best}</dt><dd>{tr(pilot.best, i18n.lang)}</dd></div>
					{/if}
					<div><dt>{t.age}</dt><dd>{pilot.age}</dd></div>
					<div><dt>{t.hometown}</dt><dd>{pilot.hometown}</dd></div>
					<div><dt>{t.since}</dt><dd>{pilot.since}</dd></div>
					<div><dt>{t.chassis}</dt><dd>{pilot.chassis}</dd></div>
					<div><dt>{t.engine}</dt><dd>{pilot.engine}</dd></div>
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
		padding-block: var(--section);
		background: var(--bg-1);
		border-block: 1px solid var(--hair);
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
	}
	.grid .card {
		border: 1px solid var(--hair);
	}

	/* ---------- card ---------- */
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
		--accent: var(--cyan);
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
		top: -0.04em;
		right: -0.04em;
		font-size: clamp(15rem, 26vw, 22rem);
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
		transition:
			filter 0.9s var(--ease-out),
			scale 1.4s var(--ease-out);
	}
	/* Photo cards: on hover the portrait drops to black and white and the number cuts in,
	   printed over it in the accent so the photo still reads through */
	.card:has(img) .no {
		color: var(--accent);
		-webkit-text-stroke: 0;
		background: none;
		mix-blend-mode: multiply;
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
		filter: grayscale(1) brightness(0.9) contrast(1.05);
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
		--accent: var(--cyan);
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
		padding: 0;
		background: none;
		backdrop-filter: none;
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
	}

	.body {
		flex: 1;
		padding: 2rem 1.75rem;
	}
	blockquote {
		font-size: clamp(1.35rem, 2.4vw, 1.7rem);
		font-weight: 600;
		font-stretch: 105%;
		letter-spacing: -0.02em;
		line-height: 1.25;
		text-wrap: balance;
	}
	.record {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		margin-top: 2rem;
		border-block: 1px solid var(--hair-2);
	}
	.record div {
		display: flex;
		flex-direction: column-reverse;
		padding: 1rem 0 1.1rem;
	}
	.record div + div {
		padding-left: 1rem;
		border-left: 1px solid var(--hair);
	}
	.record dd {
		font-size: 3rem;
	}
	.record dt,
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
		margin-top: 0.5rem;
	}
	.specs div {
		padding: 1rem 1rem 1rem 0;
		border-bottom: 1px solid var(--hair);
	}
	.specs div:first-child {
		grid-column: 1 / -1;
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
		.grid .card {
			border: 0;
		}
	}
	@media (min-width: 1100px) {
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.card {
			padding: 1.75rem;
		}
	}
</style>
