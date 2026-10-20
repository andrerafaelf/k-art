<script lang="ts">
	import Glyph from './Glyph.svelte';
	import { useI18n } from '#lib/i18n.ts';

	// A quantity with a button either side, from 1 up to max

	interface Props {
		value: number;
		max: number;
		/** What it counts, for screen readers */
		label: string;
		onchange?: (value: number) => void;
		small?: boolean;
	}

	let { value = $bindable(), max, label, onchange, small = false }: Props = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.shop);

	function set(n: number) {
		const next = Math.min(Math.max(n, 1), Math.max(max, 1));
		if (next === value) return;
		value = next;
		onchange?.(next);
	}
</script>

<div class="qty" class:small role="group" aria-label={label}>
	<button type="button" onclick={() => set(value - 1)} disabled={value <= 1} aria-label={t.less}><Glyph name="minus" /></button>
	<output aria-live="polite" aria-label={t.qty}>{value}</output>
	<button type="button" onclick={() => set(value + 1)} disabled={value >= max} aria-label={t.more}><Glyph name="plus" /></button>
</div>

<style>
	.qty {
		display: inline-grid;
		grid-template-columns: 3rem 2.5rem 3rem;
		align-items: center;
		height: 3.25rem;
		box-shadow: inset 0 0 0 1px var(--hair-2);
	}
	.small {
		grid-template-columns: 2.25rem 2rem 2.25rem;
		height: 2.5rem;
	}
	button {
		display: grid;
		place-items: center;
		height: 100%;
		color: var(--fg);
		transition:
			background-color 0.25s,
			color 0.25s;
	}
	button:hover:not(:disabled) {
		background: rgb(255 255 255 / 0.07);
	}
	button:disabled {
		color: var(--fg-3);
		cursor: default;
	}
	button :global(svg) {
		width: 0.85rem;
	}
	output {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		text-align: center;
	}
</style>
