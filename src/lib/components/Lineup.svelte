<script lang="ts">
	import TeaserHead from './TeaserHead.svelte';
	import DriverCard from './DriverCard.svelte';
	import type { Pilot } from '#lib/content.ts';
	import { useI18n, pagePath } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';
	import { columns } from '#lib/grid.ts';

	// The line-up on the home page. Each card opens the driver's profile on the drivers page.

	let { pilots, year, index }: { pilots: Pilot[]; year: number; index: string } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.drivers);
	const page = $derived(pagePath('drivers', i18n.lang));
	const cols = $derived(columns(pilots.length));
</script>

<section id="drivers" class="lineup" data-sector>
	<div class="wrap">
		<TeaserHead {index} eyebrow="{i18n.text('drivers.eyebrow')} {year}" lines={i18n.lines('drivers.title')} href={page} link={t.all} />

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
			/* A team of one or two doesn't get giant cards */
			max-width: calc(var(--n) * 30rem);
			gap: 1px;
			margin: 0;
			padding: 0;
			overflow: visible;
			border-top: 1px solid var(--hair);
			border-left: 1px solid var(--hair);
		}
		/* Hairlines drawn by each card on its right and bottom, with the grid's top
		   and left edges, so a short last row leaves a clean gap, not a grey block */
		.row > li {
			box-shadow: 1px 1px 0 var(--hair);
		}
		.row :global(.card) {
			aspect-ratio: 3 / 2;
			border: 0;
		}
	}
</style>
