<script lang="ts">
	import type { Partner } from '#lib/content.ts';

	// Partner logos in a grid of tiles, each on the tone its logo reads best on
	let { partners }: { partners: Partner[] } = $props();
</script>

<ul class="logos">
	{#each partners as p, i (p.id)}
		<li class="rv {p.tone}" style:--d="{i * 60}ms">
			{#if p.url}
				<a href={p.url} target="_blank" rel="noreferrer" title={p.name}>
					<img src={p.logo} alt={p.name} loading="lazy" />
				</a>
			{:else}
				<img src={p.logo} alt={p.name} loading="lazy" />
			{/if}
		</li>
	{/each}
</ul>

<style>
	.logos {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
		gap: 1px;
		margin: 1.75rem 0 0;
		padding: 0;
		list-style: none;
		background: var(--hair);
		border: 1px solid var(--hair);
	}
	li {
		display: grid;
		place-items: center;
		aspect-ratio: 16 / 9;
		padding: 1.5rem 1.75rem;
		background: var(--bg);
	}
	li.light {
		background: #efeee9;
	}
	a {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
	}
	img {
		max-width: 100%;
		max-height: 3.25rem;
		object-fit: contain;
		opacity: 0.85;
		transition:
			opacity 0.3s,
			scale 0.5s var(--ease-out);
	}
	li:hover img {
		opacity: 1;
		scale: 1.04;
	}
</style>
