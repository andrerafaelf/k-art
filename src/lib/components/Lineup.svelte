<script lang="ts">
	import TeaserHead from './TeaserHead.svelte';
	import DriverCard from './DriverCard.svelte';
	import type { Pilot } from '#lib/content.ts';
	import { useI18n, pagePath } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	// The line-up on the home page. Each card opens the driver's profile on the drivers page.

	let { pilots, year, index }: { pilots: Pilot[]; year: number; index: string } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.drivers);
	const page = $derived(pagePath('drivers', i18n.lang));
	// Three to a row, or four when that leaves no driver on a row alone
	const cols = $derived(pilots.length === 4 || pilots.length === 8 ? 4 : Math.min(pilots.length, 3));
</script>

<section id="drivers" class="lineup" data-sector>
	<div class="wrap">
		<TeaserHead {index} eyebrow={t.eyebrow(year)} lines={t.title} href={page} link={t.all} />

		<ul class="row" use:inview style:--n={cols}>
			{#each pilots as p, i (p.id)}
				<li class="rv" style:--d="{i * 70}ms">
					<DriverCard {p} compact href="{page}#{p.id}" />
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.lineup {
		padding-block: var(--section);
		background: var(--bg-1);
		border-block: 1px solid var(--hair);
	}

	/* A swipeable row, until there is room for the whole grid side by side */
	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: min(70%, 16rem);
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
	.row::-webkit-scrollbar {
		display: none;
	}
	.row li {
		scroll-snap-align: start;
	}
	.row :global(.card) {
		border: 1px solid var(--hair);
	}

	@media (min-width: 1100px) {
		.row {
			grid-auto-flow: row;
			grid-template-columns: repeat(var(--n), minmax(0, 1fr));
			gap: 1px;
			margin: 0;
			padding: 0;
			overflow: visible;
			background: var(--hair);
			border: 1px solid var(--hair);
		}
		.row :global(.card) {
			aspect-ratio: 3 / 2;
			border: 0;
		}
	}
</style>
