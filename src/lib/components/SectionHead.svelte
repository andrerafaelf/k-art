<script lang="ts">
	import type { Snippet } from 'svelte';
	import { inview } from '#lib/motion.ts';

	interface Props {
		eyebrow: string;
		/** Sector of the lap shown in the label, for example "S2" */
		index?: string;
		/** Title, one entry per line */
		lines: string[];
		/** Index of a line to set in lime */
		accent?: number;
		children?: Snippet;
	}

	let { eyebrow, index, lines, accent, children }: Props = $props();
</script>

<header class="head" use:inview>
	<div>
		<p class="eyebrow rv">{#if index}<b>{index}</b> ·{/if} {eyebrow}</p>
		<h2 class="display h2">
			{#each lines as line, i}
				<span class="line"
					><span class:accent={i === accent} style:--d="{60 + i * 90}ms">{line}</span></span
				>
			{/each}
		</h2>
	</div>
	{#if children}
		<div class="intro rv" style:--d="260ms">{@render children()}</div>
	{/if}
</header>

<style>
	.head {
		display: grid;
		gap: 2rem;
		align-items: end;
		margin-bottom: clamp(3rem, 6vw, 5.5rem);
	}
	h2 {
		margin-top: 1.6rem;
	}
	.accent {
		color: var(--lime);
	}
	.intro {
		max-width: 30rem;
		color: var(--fg-2);
		font-size: 1.0625rem;
		text-wrap: pretty;
	}

	@media (min-width: 960px) {
		.head {
			grid-template-columns: minmax(0, 1fr) minmax(0, 26rem);
			gap: 4rem;
		}
		.intro {
			padding-bottom: 0.4rem;
		}
	}
</style>
