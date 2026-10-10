<script lang="ts">
	import type { Snippet } from 'svelte';
	import Arrow from './Arrow.svelte';
	import { inview } from '#lib/motion.ts';

	// Heading of a section on the home page: its sector, the title on one line and
	// a link to the page with everything. The page itself has the full heading.
	interface Props {
		/** Sector of the lap, for example "S2" */
		index: string;
		eyebrow: string;
		/** The title's parts, run together on one line with the last one in blue */
		lines: string[];
		href: string;
		link: string;
		/** A short note beside the link */
		children?: Snippet;
	}

	let { index, eyebrow, lines, href, link, children }: Props = $props();
</script>

<header class="head" use:inview>
	<div>
		<p class="eyebrow rv"><b>{index}</b> · {eyebrow}</p>
		<h2 class="display">
			<span class="line"
				><span style:--d="60ms"
					>{#each lines as part, i}{#if i}{' '}{/if}<span class:accent={i === lines.length - 1}>{part}</span>{/each}</span
				></span
			>
		</h2>
	</div>
	<div class="side rv" style:--d="160ms">
		{#if children}
			<p class="note">{@render children()}</p>
		{/if}
		<a class="pagelink" {href}>{link} <Arrow /></a>
	</div>
</header>

<style>
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1.5rem 3rem;
		margin-bottom: clamp(2rem, 4vw, 3rem);
	}
	h2 {
		margin-top: 1.25rem;
		font-size: var(--t-section);
	}
	.side {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.75rem 2rem;
		padding-bottom: 0.3rem;
	}
	.note {
		max-width: 26rem;
		font-size: 0.9375rem;
		color: var(--fg-2);
		text-wrap: pretty;
	}
</style>
