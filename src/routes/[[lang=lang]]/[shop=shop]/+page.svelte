<script lang="ts">
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import Meta from '#lib/components/Meta.svelte';
	import SectionHead from '#lib/components/SectionHead.svelte';
	import ProductCard from '#lib/components/ProductCard.svelte';
	import Glyph from '#lib/components/Glyph.svelte';
	import Arrow from '#lib/components/Arrow.svelte';
	import { CATEGORIES, categoryName, maxQty, stockOf, type Category } from '#lib/shop.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	// The shop: everything for sale, filtered by category and search in the
	// browser. /loja?c=pneus opens on one category.

	let { data } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.shop);

	const categoryOf = (id: string): Category => (CATEGORIES.includes(id as Category) ? (id as Category) : 'other');
	// Things that can still be had first, sold out at the end, otherwise in the admin's order
	const products = $derived(
		[...data.products].sort((a, b) => Number(maxQty(stockOf(b), b.onOrder) > 0) - Number(maxQty(stockOf(a), a.onOrder) > 0))
	);
	const categories = $derived(CATEGORIES.filter((c) => products.some((p) => categoryOf(p.category) === c)));
	const mixed = $derived(products.some((p) => p.condition === 'used') && products.some((p) => p.condition === 'new'));

	let category = $state(page.url.searchParams.get('c') ?? '');
	let query = $state('');
	let usedOnly = $state(false);

	/** Lower case without accents, so "pneu" finds "Pneus" and "jante" finds "Jantes" */
	const fold = (s: string) =>
		s
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase();

	const shown = $derived.by(() => {
		const words = fold(query).split(/\s+/).filter(Boolean);
		return products.filter((p) => {
			if (category && categoryOf(p.category) !== category) return false;
			if (usedOnly && p.condition !== 'used') return false;
			if (!words.length) return true;
			const text = fold(
				[p.name.pt, p.name.en, p.brand, p.ref, ...p.fits, categoryName(p.category, i18n.lang), p.condition === 'used' ? t.used : '']
					.filter(Boolean)
					.join(' ')
			);
			return words.every((w) => text.includes(w));
		});
	});

	const count = (c: Category) => products.filter((p) => categoryOf(p.category) === c).length;

	function pick(c: string) {
		category = c;
		const url = new URL(page.url.href);
		if (c) url.searchParams.set('c', c);
		else url.searchParams.delete('c');
		replaceState(url, {});
	}

	function reset() {
		query = '';
		usedOnly = false;
		pick('');
	}
</script>

<Meta title={t.metaTitle} description={t.metaDescription} />

<main class="shop">
	<div class="wrap">
		<SectionHead level={1} eyebrow={i18n.text('shop.eyebrow')} lines={i18n.lines('shop.title')} accent={-1}>
			<p>{i18n.text('shop.intro')}</p>
		</SectionHead>

		{#if products.length}
			<div class="tools">
				<div class="cats" role="group" aria-label={t.filters}>
					<button type="button" class="chip-btn" aria-pressed={!category} onclick={() => pick('')}>
						<span>{t.all} <small>{products.length}</small></span>
					</button>
					{#each categories as c (c)}
						<button type="button" class="chip-btn" aria-pressed={category === c} onclick={() => pick(c)}>
							<span>{categoryName(c, i18n.lang)} <small>{count(c)}</small></span>
						</button>
					{/each}
					{#if mixed}
						<button type="button" class="chip-btn used" aria-pressed={usedOnly} onclick={() => (usedOnly = !usedOnly)}>
							<span>{t.usedOnly}</span>
						</button>
					{/if}
				</div>
				<label class="search">
					<Glyph name="search" />
					<span class="sr-only">{t.searchLabel}</span>
					<input type="search" bind:value={query} placeholder={t.search} autocomplete="off" enterkeyhint="search" />
				</label>
			</div>

			<p class="count" aria-live="polite">{t.count(shown.length)}</p>

			{#if shown.length}
				<ul class="grid" use:inview>
					{#each shown as product, i (product.id)}
						<li class="rv" style:--d="{(i % 4) * 70}ms"><ProductCard {product} /></li>
					{/each}
				</ul>
			{:else}
				<div class="none">
					<p>{t.noMatch}</p>
					<button type="button" class="pagelink" onclick={reset}>{t.clear} <Arrow /></button>
				</div>
			{/if}

			<p class="terms">{t.vat}. {i18n.text('shop.terms')}</p>
		{:else}
			<p class="empty">{i18n.text('shop.empty')}</p>
		{/if}
	</div>
</main>

<style>
	.shop {
		padding-block: var(--page-top) var(--section);
	}
	.empty {
		padding-block: 2rem 4rem;
		color: var(--fg-2);
	}

	/* ---------- filters ---------- */
	.tools {
		display: grid;
		gap: 1rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid var(--hair);
	}
	/* Phones: one row that scrolls sideways. Wider: as many rows as it takes */
	.cats {
		display: flex;
		gap: 0.5rem;
		margin-inline: calc(var(--gutter) * -1);
		padding: 0.15rem var(--gutter);
		overflow-x: auto;
		scrollbar-width: none;
	}
	.cats::-webkit-scrollbar {
		display: none;
	}
	/* Slanted like the stroke in the logo */
	.chip-btn {
		flex-shrink: 0;
		height: 2.5rem;
		padding: 0 0.95rem;
		box-shadow: inset 0 0 0 1px var(--hair-2);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		white-space: nowrap;
		color: var(--fg-2);
		transform: skewX(-12deg);
		transition:
			background-color 0.3s var(--ease-out),
			color 0.3s var(--ease-out),
			box-shadow 0.3s var(--ease-out);
	}
	.chip-btn > span {
		display: inline-block;
		transform: skewX(12deg);
	}
	.chip-btn small {
		margin-left: 0.3rem;
		font-size: inherit;
		font-weight: 500;
		opacity: 0.6;
	}
	.chip-btn:hover {
		color: var(--fg);
		box-shadow: inset 0 0 0 1px var(--fg-3);
	}
	.chip-btn[aria-pressed='true'] {
		background: var(--lime);
		color: var(--black);
		box-shadow: none;
	}
	.chip-btn.used {
		margin-left: 0.5rem;
	}

	.search {
		position: relative;
		display: block;
	}
	.search :global(svg) {
		position: absolute;
		top: 50%;
		left: 0.95rem;
		width: 1rem;
		translate: 0 -50%;
		color: var(--fg-3);
		pointer-events: none;
	}
	.search input {
		width: 100%;
		height: 2.75rem;
		padding: 0 1rem 0 2.6rem;
		border: 1px solid var(--hair-2);
		border-radius: 0;
		background: var(--bg-1);
		color: var(--fg);
		font: inherit;
		font-size: 0.9375rem;
		transition: border-color 0.3s;
	}
	.search input::placeholder {
		color: var(--fg-3);
	}
	.search input:hover {
		border-color: var(--fg-3);
	}
	.search input:focus-visible {
		outline: none;
		border-color: var(--lime);
	}

	.count {
		margin-block: 1.25rem 1.5rem;
		font-size: 0.8125rem;
		color: var(--fg-3);
	}

	/* ---------- grid ---------- */
	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 2.25rem 0.9rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.none {
		display: grid;
		justify-items: start;
		gap: 1rem;
		padding-block: 2rem 3rem;
		color: var(--fg-2);
	}
	.terms {
		max-width: 40rem;
		margin-top: clamp(3rem, 6vw, 4.5rem);
		padding-top: 1.25rem;
		border-top: 1px solid var(--hair);
		font-size: 0.875rem;
		color: var(--fg-3);
	}

	@media (min-width: 760px) {
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 3rem 1.5rem;
		}
	}
	@media (min-width: 960px) {
		.tools {
			grid-template-columns: minmax(0, 1fr) 20rem;
			align-items: start;
		}
		.cats {
			flex-wrap: wrap;
			margin: 0;
			padding: 0.15rem 0 0;
			overflow: visible;
		}
	}
	@media (min-width: 1200px) {
		.grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
