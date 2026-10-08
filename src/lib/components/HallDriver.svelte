<script lang="ts">
	import Trophy from './Trophy.svelte';
	import { tr, type Alumnus } from '#lib/content.ts';
	import { useI18n } from '#lib/i18n.ts';

	let { a, compact = false }: { a: Alumnus; compact?: boolean } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.hall);
	const titles = $derived(tr(a.titles, i18n.lang).filter((x) => x.trim()));
	const now = $derived(tr(a.now, i18n.lang));
</script>

<article class="plaque {a.accent}" class:compact>
	<span class="ghost num" aria-hidden="true">{a.number}</span>
	{#if a.photo && !compact}
		<img src={a.photo} alt="" loading="lazy" />
	{/if}

	<header>
		<span class="plate num">{a.number}</span>
		<span class="chip">{t.years(a.from, a.to)}</span>
	</header>

	<h3>
		<span class="first">{a.first}</span>
		<span class="last">{a.last}</span>
	</h3>
	<p class="cats mono">{a.categories}</p>

	{#if !compact}
		<dl class="record">
			<div><dt class="mono">{t.stats.wins}</dt><dd class="mono">{a.record.wins}</dd></div>
			<div><dt class="mono">{t.stats.podiums}</dt><dd class="mono">{a.record.podiums}</dd></div>
			<div><dt class="mono">{t.stats.poles}</dt><dd class="mono">{a.record.poles}</dd></div>
		</dl>
		{#if titles.length}
			<ul class="titles">
				{#each titles as title}
					<li><Trophy /> {title}</li>
				{/each}
			</ul>
		{/if}
	{/if}

	{#if now}
		<p class="now mono"><span>{t.now}</span> {now}</p>
	{/if}
</article>

<style>
	.plaque {
		--accent: var(--lime);
		position: relative;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 1.4rem 1.4rem 1.5rem;
		overflow: hidden;
		background: var(--bg-1);
		box-shadow: inset 0 0 0 1px var(--hair-2);
		transition: box-shadow 0.4s;
	}
	.plaque.cyan {
		--accent: var(--cyan);
	}
	.plaque:hover {
		box-shadow: inset 0 0 0 1px var(--accent);
	}
	.ghost {
		position: absolute;
		z-index: -1;
		top: -0.1em;
		right: -0.05em;
		font-size: 11rem;
		font-weight: 900;
		line-height: 1;
		color: transparent;
		-webkit-text-stroke: 1.5px rgb(255 255 255 / 0.07);
		transition: -webkit-text-stroke-color 0.5s;
	}
	.plaque:hover .ghost {
		-webkit-text-stroke-color: var(--accent);
	}
	img {
		position: absolute;
		z-index: -2;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0.35;
		mask-image: linear-gradient(transparent, #000 20%, transparent 85%);
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.plate {
		display: grid;
		place-items: center;
		min-width: 2.6rem;
		height: 2.1rem;
		padding-inline: 0.35rem;
		background: var(--plate);
		color: var(--black);
		font-size: 1.4rem;
		clip-path: polygon(0 0, 100% 0, calc(100% - 7px) 100%, 0 100%);
	}
	h3 {
		display: flex;
		flex-direction: column;
		margin-top: 3rem;
	}
	.first {
		font-size: 1rem;
		font-weight: 500;
		color: var(--fg-2);
	}
	.last {
		font-size: clamp(1.75rem, 2.6vw, 2.25rem);
		font-style: italic;
		font-stretch: 125%;
		font-weight: 900;
		letter-spacing: -0.035em;
		line-height: 0.95;
		text-transform: uppercase;
	}
	.cats {
		margin-top: 0.6rem;
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--accent);
	}
	.record {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		margin-top: 1.5rem;
		border-block: 1px solid var(--hair);
	}
	.record div {
		display: flex;
		flex-direction: column-reverse;
		gap: 0.2rem;
		padding: 0.75rem 0;
	}
	.record div + div {
		padding-left: 0.9rem;
		border-left: 1px solid var(--hair);
	}
	dt {
		font-size: 0.6rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	dd {
		font-size: 1.6rem;
		font-weight: 600;
		line-height: 1;
	}
	.titles {
		display: grid;
		gap: 0.45rem;
		margin: 1rem 0 0;
		padding: 0;
		list-style: none;
	}
	.titles li {
		display: flex;
		gap: 0.55rem;
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1.35;
	}
	.titles :global(svg) {
		flex-shrink: 0;
		width: 1rem;
		margin-top: 0.08rem;
		color: var(--lime);
	}
	.now {
		margin-top: auto;
		padding-top: 1.25rem;
		font-size: 0.75rem;
		color: var(--fg);
	}
	.now span {
		display: block;
		margin-bottom: 0.25rem;
		font-size: 0.6rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.compact h3 {
		margin-top: 2rem;
	}
</style>
