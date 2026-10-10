<script lang="ts">
	import { LOGO_W, LOGO_H, LOGO_WORD_H, LOGO_MARK, LOGO_WORD, LOGO_TAG } from '#lib/brand.ts';

	// Official colourways: the team's full colour, with the K in lime and ART and
	// RACING TEAM in blue; the K in lime with the rest in white on dark backgrounds
	// or black on light ones; or everything in a single colour.
	interface Props {
		tagline?: boolean;
		/** 'full' for lime and blue, 'lime' for a lime K with the rest in currentColor, 'mono' for all currentColor */
		accent?: 'full' | 'lime' | 'mono';
		class?: string;
		label?: string;
	}

	let { tagline = true, accent = 'lime', class: klass = '', label = "K'ART Racing Team" }: Props = $props();

	const markFill = $derived(accent === 'mono' ? 'currentColor' : 'var(--lime)');
	const wordFill = $derived(accent === 'full' ? 'var(--blue)' : 'currentColor');
</script>

<svg
	class={klass}
	viewBox="0 0 {LOGO_W} {tagline ? LOGO_H : LOGO_WORD_H}"
	role="img"
	aria-label={label}
	xmlns="http://www.w3.org/2000/svg"
>
	<g fill={markFill}>
		{#each LOGO_MARK as d}<path {d} />{/each}
	</g>
	<g fill={wordFill}>
		{#each LOGO_WORD as d}<path {d} />{/each}
		{#if tagline}
			{#each LOGO_TAG as d}<path {d} />{/each}
		{/if}
	</g>
</svg>
