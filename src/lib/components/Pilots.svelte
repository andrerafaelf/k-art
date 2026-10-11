<script lang="ts">
	import SectionHead from './SectionHead.svelte';
	import DriverCard from './DriverCard.svelte';
	import DriverSheet from './DriverSheet.svelte';
	import type { Pilot } from '#lib/content.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';
	import { columns } from '#lib/grid.ts';

	// The drivers page. A profile opens over the grid, and /pilotos#<driver id>
	// opens straight onto that driver.

	let { pilots, year }: { pilots: Pilot[]; year: number } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.drivers);
	const classes = $derived(new Set(pilots.map((p) => p.category)).size);

	let sheet: DriverSheet | undefined = $state();
	const show = (i: number) => sheet?.show(i);

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
		<SectionHead level={1} eyebrow="{i18n.text('drivers.eyebrow')} {year}" lines={i18n.lines('drivers.title')} accent={-1}>
			{#if pilots.length}
				<p>{t.count(pilots.length, classes)} {i18n.text('drivers.intro')}</p>
			{/if}
		</SectionHead>

		{#if pilots.length}
			<ul class="grid" use:inview style:--n={columns(pilots.length)}>
				{#each pilots as p, i (p.id)}
					<li id={p.id} class="rv" style:--d="{(i % 3) * 90}ms">
						<DriverCard {p} onclick={() => show(i)} />
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty">{i18n.text('drivers.empty')}</p>
		{/if}
	</div>
</section>

{#if pilots.length}
	<DriverSheet {pilots} bind:this={sheet} />
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

	@media (min-width: 700px) {
		.grid {
			grid-auto-flow: row;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 1px;
			margin: 0;
			padding: 0;
			overflow: visible;
			border-top: 1px solid var(--hair);
			border-left: 1px solid var(--hair);
		}
		/* Hairlines drawn by each card on its right and bottom, with the grid's top
		   and left edges, so a short last row leaves a clean gap, not a grey block */
		.grid > li {
			box-shadow: 1px 1px 0 var(--hair);
		}
		.grid :global(.card) {
			border: 0;
		}
	}
	/* Two to a row; an odd driver out gets a card the full width of the row */
	@media (min-width: 700px) and (max-width: 1099px) {
		.grid li:last-child:nth-child(odd) {
			grid-column: 1 / -1;
		}
		.grid li:last-child:nth-child(odd) :global(.card) {
			aspect-ratio: 8 / 4.3;
		}
	}
	/* As many to a row as leaves no driver on the last row alone (lib/grid.ts) */
	@media (min-width: 1100px) {
		.grid {
			grid-template-columns: repeat(var(--n), minmax(0, 1fr));
			max-width: calc(var(--n) * 30rem);
		}
		.grid :global(.card) {
			padding: 1.75rem;
		}
	}
</style>
