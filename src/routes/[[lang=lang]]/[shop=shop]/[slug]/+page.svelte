<script lang="ts">
	import { page } from '$app/state';
	import Meta from '#lib/components/Meta.svelte';
	import Arrow from '#lib/components/Arrow.svelte';
	import Glyph from '#lib/components/Glyph.svelte';
	import Gallery from '#lib/components/Gallery.svelte';
	import Stock from '#lib/components/Stock.svelte';
	import Qty from '#lib/components/Qty.svelte';
	import { tr } from '#lib/content.ts';
	import {
		OPTION_NAME,
		categoryName,
		maxQty,
		money,
		optionOf,
		priceOf,
		priceRange,
		stockOf,
		stockState
	} from '#lib/shop.ts';
	import { LOGO_MARK } from '#lib/brand.ts';
	import { useI18n, shopPath, listPath } from '#lib/i18n.ts';
	import { list } from '#lib/list.svelte.ts';
	import { render } from '#lib/markdown.ts';
	import '#lib/prose.css';

	let { data } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.shop);
	const p = $derived(data.product);
	const name = $derived(tr(p.name, i18n.lang));
	const html = $derived(render(tr(p.description, i18n.lang)));
	const note = $derived(tr(p.conditionNote, i18n.lang));
	const optionName = $derived(tr(p.optionName, i18n.lang) || OPTION_NAME[i18n.lang]);

	// A product with a single option starts with it chosen
	let chosen = $state<string>();
	$effect.pre(() => {
		chosen = p.options.length === 1 ? p.options[0].id : undefined;
	});
	const option = $derived(optionOf(p, chosen));
	const needsOption = $derived(p.options.length > 0 && !option);

	const stock = $derived(stockOf(p, option));
	const max = $derived(maxQty(stock, p.onOrder));
	const range = $derived(priceRange(p));
	const unit = $derived(option ? priceOf(p, option) : p.options.length ? range.min : p.price);
	const fromPrice = $derived(!option && range.varies);

	let qty = $state(1);
	$effect.pre(() => {
		if (qty > Math.max(max, 1)) qty = Math.max(max, 1);
	});
	const onList = $derived(list.qty(p.id, chosen));

	let asked = $state(false);
	let added = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	function add() {
		if (needsOption) {
			asked = true;
			return;
		}
		list.add(p.id, chosen, qty, max);
		added = true;
		clearTimeout(timer);
		timer = setTimeout(() => (added = false), 1800);
	}

	// What search engines read: name, photos, price, condition and stock
	const structured = $derived.by(() => {
		const url = page.url.origin + shopPath(i18n.lang, p.slug);
		const total = stockOf(p);
		const state = stockState(total, p.onOrder);
		return JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Product',
			name,
			url,
			...(p.photos.length && { image: p.photos.map((src) => page.url.origin + src) }),
			...(p.ref && { mpn: p.ref }),
			...(p.brand && { brand: { '@type': 'Brand', name: p.brand } }),
			category: categoryName(p.category, i18n.lang),
			...(range.min !== undefined && {
				offers: {
					'@type': 'Offer',
					url,
					priceCurrency: 'EUR',
					price: (range.min / 100).toFixed(2),
					itemCondition: `https://schema.org/${p.condition === 'used' ? 'UsedCondition' : 'NewCondition'}`,
					availability: `https://schema.org/${state === 'out' ? 'OutOfStock' : state === 'order' ? 'BackOrder' : 'InStock'}`
				}
			})
		}).replace(/</g, '\\u003c');
	});
</script>

<Meta title="{name}, K'ART Racing Team" description={tr(p.description, i18n.lang).replace(/[#>*_[\]()-]/g, '').slice(0, 160) || t.metaDescription} image={p.photos[0]} />

<svelte:head>
	{@html `<script type="application/ld+json">${structured}</script>`}
	{#if !p.visible}<meta name="robots" content="noindex, nofollow" />{/if}
</svelte:head>

<main class="wrap">
	<a class="back" href={shopPath(i18n.lang)}><Arrow dir="left" /> {t.back}</a>

	<div class="product">
		<div class="pics">
			{#if p.photos.length}
				<Gallery photos={p.photos} alt={name} />
			{:else}
				<div class="blank">
					<svg viewBox="0 0 261 136" aria-hidden="true">{#each LOGO_MARK as d}<path {d} />{/each}</svg>
				</div>
			{/if}
		</div>

		<div class="info">
			<p class="eyebrow">{categoryName(p.category, i18n.lang)}</p>
			<h1>{name}</h1>
			{#if p.condition === 'used'}<span class="tag">{t.used}</span>{/if}

			<div class="price">
				{#if unit === undefined}
					<p class="request">{t.onRequest}</p>
				{:else}
					<p class="now">
						{#if fromPrice}<small>{t.from('')}</small>{/if}{money(unit, i18n.lang)}
					</p>
					{#if p.was && !fromPrice && p.was > unit}
						<s aria-label={t.was(money(p.was, i18n.lang))}>{money(p.was, i18n.lang)}</s>
					{/if}
					<span class="vat">{t.vat}</span>
				{/if}
			</div>

			<Stock {stock} onOrder={p.onOrder} />

			{#if p.options.length}
				<fieldset class="options" class:asked={asked && needsOption}>
					<legend>{t.pick(optionName)}</legend>
					<div class="choices">
						{#each p.options as o (o.id)}
							{@const gone = maxQty(o.stock, p.onOrder) === 0}
							<label class="choice" class:gone>
								<input
									type="radio"
									name="option"
									value={o.id}
									bind:group={chosen}
									disabled={gone}
									aria-label={gone ? t.soldOut(o.label) : undefined}
									onchange={() => (asked = false)}
								/>
								<span><span>{o.label}</span></span>
							</label>
						{/each}
					</div>
					{#if asked && needsOption}<p class="hint" role="alert">{t.pickFirst}</p>{/if}
				</fieldset>
			{/if}

			{#if max > 0 || needsOption}
				<div class="buy">
					<Qty bind:value={qty} max={needsOption ? 99 : max} label={t.qty} />
					<button type="button" class="btn add" class:added onclick={add}>
						{added ? t.added : t.add}
						<Glyph name={added ? 'check' : 'plus'} />
					</button>
				</div>
			{/if}
			{#if onList}
				<p class="onlist">
					<Glyph name="check" />
					{t.onList(onList)}
					<a class="pagelink" href={listPath(i18n.lang)}>{t.view} <Arrow /></a>
				</p>
			{/if}

			<dl class="specs">
				<div>
					<dt>{t.condition}</dt>
					<dd>{p.condition === 'used' ? t.used : t.new}{#if p.condition === 'used' && note}<span class="note">{note}</span>{/if}</dd>
				</div>
				{#if p.brand}
					<div>
						<dt>{t.brand}</dt>
						<dd>{p.brand}</dd>
					</div>
				{/if}
				{#if p.ref}
					<div>
						<dt>{t.ref}</dt>
						<dd class="mono">{p.ref}</dd>
					</div>
				{/if}
				{#if p.fits.length}
					<div>
						<dt>{t.fits}</dt>
						<dd class="fits">{#each p.fits as f}<span class="chip">{f}</span>{/each}</dd>
					</div>
				{/if}
			</dl>

			<p class="terms">{i18n.text('shop.terms')}</p>
		</div>

		{#if html}
			<div class="about prose">
				<!-- render() escapes everything before adding its few tags -->
				{@html html}
			</div>
		{/if}
	</div>
</main>

<style>
	main {
		padding-top: calc(var(--nav-h) + env(safe-area-inset-top, 0px) + clamp(2rem, 5vw, 3.5rem));
		padding-bottom: var(--section);
	}
	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--fg-2);
		transition: color 0.3s;
	}
	.back:hover {
		color: var(--fg);
	}
	.back :global(svg) {
		width: 0.9rem;
		color: var(--lime);
	}

	.product {
		display: grid;
		grid-template-areas: 'pics' 'info' 'about';
		gap: 2rem;
	}
	.pics {
		grid-area: pics;
		min-width: 0;
	}
	.blank {
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		background: var(--bg-2);
	}
	.blank svg {
		width: 40%;
		fill: rgb(255 255 255 / 0.05);
	}
	.info {
		grid-area: info;
		min-width: 0;
	}
	.about {
		grid-area: about;
		min-width: 0;
		max-width: 42rem;
	}

	h1 {
		margin-top: 1.1rem;
		font-size: var(--t-section);
		font-weight: 800;
		font-stretch: 115%;
		letter-spacing: -0.03em;
		line-height: 1.05;
		text-wrap: balance;
	}
	.tag {
		display: inline-block;
		margin-top: 0.9rem;
		padding: 0.3rem 0.55rem;
		background: var(--fg);
		color: var(--black);
		font-size: 0.6875rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		line-height: 1;
		text-transform: uppercase;
	}

	.price {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.4rem 0.9rem;
		margin-block: 1.5rem 0.75rem;
	}
	.now {
		font-size: var(--t-figure);
		font-style: italic;
		font-stretch: 70%;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.01em;
		line-height: 1;
	}
	.now small {
		margin-right: 0.35rem;
		font-size: 0.45em;
		font-style: normal;
		font-stretch: 100%;
		font-weight: 600;
		color: var(--fg-2);
	}
	s {
		font-size: 1rem;
		color: var(--fg-3);
	}
	.vat {
		font-size: 0.8125rem;
		color: var(--fg-3);
	}
	.request {
		font-size: var(--t-lead);
		font-weight: 700;
	}

	/* ---------- options ---------- */
	.options {
		margin: 1.75rem 0 0;
		padding: 0;
		border: 0;
	}
	legend {
		padding: 0;
		margin-bottom: 0.75rem;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-2);
	}
	.choices {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.choice {
		position: relative;
		cursor: pointer;
	}
	.choice input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: inherit;
	}
	/* Slanted like the stroke in the logo */
	.choice > span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 3rem;
		height: 2.75rem;
		padding: 0 0.9rem;
		box-shadow: inset 0 0 0 1px var(--hair-2);
		font-weight: 700;
		transform: skewX(-12deg);
		transition:
			background-color 0.3s var(--ease-out),
			color 0.3s var(--ease-out),
			box-shadow 0.3s var(--ease-out);
	}
	.choice > span > span {
		transform: skewX(12deg);
	}
	.choice:hover > span {
		box-shadow: inset 0 0 0 1px var(--fg-3);
	}
	.choice input:checked + span {
		background: var(--lime);
		color: var(--black);
		box-shadow: none;
	}
	.choice input:focus-visible + span {
		outline: 2px solid var(--lime);
		outline-offset: 3px;
	}
	.choice.gone {
		cursor: not-allowed;
	}
	.choice.gone > span {
		color: var(--fg-3);
		box-shadow: inset 0 0 0 1px var(--hair);
		text-decoration: line-through;
	}
	.asked legend,
	.hint {
		color: var(--lime);
	}
	.hint {
		margin-top: 0.6rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	/* ---------- buying ---------- */
	.buy {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.75rem;
	}
	.add {
		flex: 1 1 12rem;
		justify-content: space-between;
	}
	.add.added {
		--b: #fff;
	}
	.onlist {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.6rem;
		margin-top: 1rem;
		font-size: 0.9375rem;
		color: var(--fg-2);
	}
	.onlist > :global(svg) {
		width: 0.9rem;
		color: var(--lime);
	}
	.onlist .pagelink {
		margin-left: 0.5rem;
	}

	/* ---------- details ---------- */
	.specs {
		margin-top: 2.25rem;
		border-top: 1px solid var(--hair);
	}
	.specs > div {
		display: grid;
		grid-template-columns: 9rem minmax(0, 1fr);
		gap: 1rem;
		padding-block: 0.85rem;
		border-bottom: 1px solid var(--hair);
		font-size: 0.9375rem;
	}
	dt {
		color: var(--fg-3);
	}
	dd {
		font-weight: 600;
	}
	.note {
		display: block;
		margin-top: 0.2rem;
		font-weight: 400;
		color: var(--fg-2);
	}
	.fits {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.terms {
		margin-top: 1.5rem;
		font-size: 0.875rem;
		color: var(--fg-3);
	}

	@media (min-width: 960px) {
		.product {
			grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
			grid-template-areas: 'pics info' 'about info';
			grid-template-rows: auto 1fr;
			gap: 2.5rem clamp(2.5rem, 5vw, 5rem);
		}
		.info {
			position: sticky;
			top: calc(var(--nav-compact) + 2rem);
			align-self: start;
		}
	}
</style>
