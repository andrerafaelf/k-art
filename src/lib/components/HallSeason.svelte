<script lang="ts">
	import Trophy from './Trophy.svelte';
	import { tr, type SeasonArchive } from '#lib/content.ts';
	import { useI18n } from '#lib/i18n.ts';

	// One archived season. "card" for the homepage, "full" for the Hall of Fame page.
	let { s, variant = 'card' }: { s: SeasonArchive; variant?: 'card' | 'full' } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.hall);
	const titles = $derived(tr(s.titles, i18n.lang).filter((x) => x.trim()));
	const stats = $derived([
		{ v: s.stats.rounds, l: t.stats.rounds },
		{ v: s.stats.wins, l: t.stats.wins },
		{ v: s.stats.podiums, l: t.stats.podiums },
		{ v: s.stats.poles, l: t.stats.poles }
	]);
</script>

<article class="season {variant}" class:striped={titles.length > 0}>
	<span class="year" aria-hidden="true">{s.year}</span>

	<div class="body">
		<p class="tag mono"><span>{s.year}</span>{#if titles.length}<span class="win"><Trophy /> {titles.length}</span>{/if}</p>
		<h3>{tr(s.headline, i18n.lang)}</h3>
		{#if variant === 'full' && tr(s.summary, i18n.lang)}
			<p class="summary">{tr(s.summary, i18n.lang)}</p>
		{/if}

		<dl class="stats">
			{#each stats as x}
				<div><dt class="mono">{x.l}</dt><dd class="mono">{x.v}</dd></div>
			{/each}
		</dl>

		{#if titles.length}
			<ul class="titles">
				{#each variant === 'full' ? titles : titles.slice(0, 1) as title}
					<li><Trophy /> {title}</li>
				{/each}
			</ul>
		{/if}

		{#if variant === 'full' && s.lineup}
			<p class="lineup mono"><span>{t.lineup}</span> {s.lineup}</p>
		{/if}
	</div>
</article>

<style>
	.season {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		background: linear-gradient(160deg, var(--bg-2), var(--bg-1) 60%);
		box-shadow: inset 0 0 0 1px var(--hair-2);
		transition: box-shadow 0.4s;
	}
	.season:hover {
		box-shadow: inset 0 0 0 1px rgb(214 249 6 / 0.45);
	}

	/* Giant outlined year behind the content */
	.year {
		position: absolute;
		z-index: -1;
		right: -0.06em;
		bottom: -0.2em;
		font-size: 9rem;
		font-style: italic;
		font-stretch: 70%;
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.04em;
		color: transparent;
		-webkit-text-stroke: 1.5px rgb(255 255 255 / 0.1);
		transition:
			-webkit-text-stroke-color 0.5s,
			translate 0.9s var(--ease-out);
	}
	.season:hover .year {
		-webkit-text-stroke-color: rgb(214 249 6 / 0.55);
		translate: -0.04em 0;
	}

	.body {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 1.5rem 1.5rem 1.75rem;
	}
	.tag {
		display: flex;
		justify-content: space-between;
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		color: var(--fg-2);
	}
	.win {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--lime);
	}
	.win :global(svg) {
		width: 0.9rem;
	}
	h3 {
		margin-top: 2.25rem;
		font-size: clamp(1.6rem, 2.4vw, 2.2rem);
		font-style: italic;
		font-stretch: 125%;
		font-weight: 900;
		letter-spacing: -0.035em;
		line-height: 0.95;
		text-transform: uppercase;
		text-wrap: balance;
	}
	.summary {
		margin-top: 1rem;
		max-width: 40rem;
		color: var(--fg-2);
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(4, auto);
		justify-content: start;
		gap: 0.25rem 1.5rem;
		margin-top: 1.5rem;
	}
	.stats div {
		display: flex;
		flex-direction: column-reverse;
		gap: 0.2rem;
	}
	dt {
		font-size: 0.6rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	dd {
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1;
	}
	.titles {
		display: grid;
		gap: 0.5rem;
		margin: 1.5rem 0 0;
		padding: 1rem 0 0;
		list-style: none;
		border-top: 1px solid var(--hair);
	}
	.titles li {
		display: flex;
		gap: 0.6rem;
		font-size: 0.9375rem;
		font-weight: 600;
		line-height: 1.35;
	}
	.titles :global(svg) {
		flex-shrink: 0;
		width: 1.05rem;
		margin-top: 0.1rem;
		color: var(--lime);
	}
	.lineup {
		margin-top: 1.25rem;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		color: var(--fg-2);
	}
	.lineup span {
		margin-right: 0.5rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-3);
	}

	/* Full width on the Hall of Fame page */
	.full .year {
		font-size: clamp(9rem, 22vw, 20rem);
	}
	.full .body {
		padding: clamp(1.75rem, 4vw, 3rem);
	}
	.full h3 {
		font-size: clamp(2.2rem, 5vw, 4.25rem);
	}
	.full .stats {
		gap: 0.25rem clamp(1.5rem, 4vw, 3.5rem);
		margin-top: 2rem;
	}
	.full dd {
		font-size: clamp(2rem, 3.6vw, 3rem);
	}
	.full .titles {
		max-width: 44rem;
	}
	.full .titles li {
		font-size: 1.0625rem;
	}
</style>
