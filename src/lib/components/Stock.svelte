<script lang="ts">
	import { stockState } from '#lib/shop.ts';
	import { useI18n } from '#lib/i18n.ts';

	// Whether something is in stock, as a light and a few words: green in stock,
	// lime for the last units, blue when it can be ordered in, unlit when sold out

	let { stock, onOrder }: { stock: number; onOrder: boolean } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.shop.stock);
	const state = $derived(stockState(stock, onOrder));
	const label = $derived(state === 'in' ? t.in(stock) : state === 'low' ? t.low(stock) : t[state]);
</script>

<span class="stock {state}"><i aria-hidden="true"></i>{label}</span>

<style>
	.stock {
		display: inline-flex;
		align-items: baseline;
		gap: 0.5rem;
		font-size: 0.8125rem;
		line-height: 1.35;
		color: var(--fg-2);
	}
	i {
		flex-shrink: 0;
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: var(--green);
		translate: 0 -0.05rem;
	}
	.low i {
		background: var(--lime);
		box-shadow: 0 0 0 3px rgb(214 249 6 / 0.18);
	}
	.order i {
		background: var(--blue);
	}
	.out {
		color: var(--fg-3);
	}
	.out i {
		background: none;
		box-shadow: inset 0 0 0 1.5px var(--fg-3);
	}
</style>
