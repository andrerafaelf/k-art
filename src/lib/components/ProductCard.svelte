<script lang="ts">
	import Glyph from './Glyph.svelte';
	import Stock from './Stock.svelte';
	import { tr, type Product } from '#lib/content.ts';
	import { categoryName, maxQty, money, priceRange, stockOf } from '#lib/shop.ts';
	import { LOGO_MARK } from '#lib/brand.ts';
	import { useI18n, shopPath } from '#lib/i18n.ts';
	import { list } from '#lib/list.svelte.ts';

	// A product in the shop grid. The whole card opens the product; things
	// without sizes can go straight on the list with the button on the photo.

	let { product }: { product: Omit<Product, 'description'> } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.shop);
	const p = $derived(product);
	const name = $derived(tr(p.name, i18n.lang));
	const stock = $derived(stockOf(p));
	const range = $derived(priceRange(p));
	const max = $derived(maxQty(stock, p.onOrder));
	const onList = $derived(list.qty(p.id));
	const quick = $derived(!p.options.length && max > 0);

	let done = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	function add() {
		list.add(p.id, undefined, 1, max);
		done = true;
		clearTimeout(timer);
		timer = setTimeout(() => (done = false), 1600);
	}
</script>

<article class="card" class:out={max === 0}>
	<div class="photo">
		{#if p.photos[0]}
			<img src={p.photos[0]} alt="" loading="lazy" />
		{:else}
			<svg class="blank" viewBox="0 0 261 136" aria-hidden="true">
				{#each LOGO_MARK as d}<path {d} />{/each}
			</svg>
		{/if}
		{#if p.condition === 'used'}<span class="tag">{t.used}</span>{/if}
		{#if quick}
			<button
				class="add"
				class:done
				type="button"
				onclick={add}
				disabled={onList >= max}
				aria-label={t.addOne(name)}
				title={onList ? t.onList(onList) : t.add}
			>
				<Glyph name={done ? 'check' : 'plus'} />
				{#if onList}<span class="n">{onList}</span>{/if}
			</button>
		{/if}
	</div>

	<div class="text">
		<p class="meta">{[categoryName(p.category, i18n.lang), p.brand].filter(Boolean).join(' · ')}</p>
		<h3><a href={shopPath(i18n.lang, p.slug)}>{name}</a></h3>
		<p class="price">
			{#if range.min === undefined}
				<span class="request">{t.onRequest}</span>
			{:else}
				<span class="now">{range.varies ? t.from(money(range.min, i18n.lang)) : money(range.min, i18n.lang)}</span>
				{#if p.was && !range.varies && p.was > range.min}
					<s>{money(p.was, i18n.lang)}</s>
				{/if}
			{/if}
		</p>
		<Stock {stock} onOrder={p.onOrder} />
	</div>
</article>

<style>
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.photo {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		background: var(--bg-2);
	}
	.photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: scale 1.2s var(--ease-out);
	}
	.card:hover .photo img {
		scale: 1.04;
	}
	.out .photo img {
		filter: grayscale(1);
		opacity: 0.55;
	}
	/* No photo yet: the K from the logo, barely there */
	.blank {
		position: absolute;
		inset: 0;
		margin: auto;
		width: 46%;
		fill: rgb(255 255 255 / 0.05);
	}
	.tag {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		padding: 0.3rem 0.55rem;
		background: var(--fg);
		color: var(--black);
		font-size: 0.6875rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		line-height: 1;
		text-transform: uppercase;
	}

	.text {
		display: flex;
		flex-direction: column;
		flex: 1;
		gap: 0.35rem;
		padding-top: 1rem;
	}
	.meta {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--fg-3);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	h3 {
		font-size: 1.0625rem;
		font-weight: 700;
		line-height: 1.3;
		letter-spacing: -0.01em;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	/* The whole card opens the product */
	h3 a::after {
		content: '';
		position: absolute;
		inset: 0;
	}
	h3 a:focus-visible {
		outline: none;
	}
	.card:has(h3 a:focus-visible) {
		outline: 2px solid var(--lime);
		outline-offset: 4px;
	}
	.price {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.2rem 0.6rem;
		margin-top: auto;
		padding-top: 0.5rem;
	}
	.now {
		font-size: 1.0625rem;
		font-weight: 800;
		font-stretch: 110%;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.request {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--fg-2);
	}
	s {
		font-size: 0.8125rem;
		color: var(--fg-3);
		white-space: nowrap;
	}

	/* Straight on the list, from the corner of the photo */
	.add {
		position: absolute;
		z-index: 1;
		right: 0.6rem;
		bottom: 0.6rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		min-width: 2.5rem;
		height: 2.5rem;
		padding-inline: 0.7rem;
		background: var(--lime);
		color: var(--black);
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		transition:
			background-color 0.3s var(--ease-out),
			transform 0.3s var(--ease-out);
	}
	.add :global(svg) {
		width: 0.9rem;
	}
	.add:hover:not(:disabled) {
		background: #fff;
	}
	.add:active:not(:disabled) {
		transform: scale(0.94);
	}
	.add:disabled {
		cursor: default;
		background: var(--fg);
	}
	.n {
		font-size: 0.8125rem;
	}
</style>
