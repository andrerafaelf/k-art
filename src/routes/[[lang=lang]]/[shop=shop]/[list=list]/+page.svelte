<script lang="ts">
	import { tick } from 'svelte';
	import Meta from '#lib/components/Meta.svelte';
	import Arrow from '#lib/components/Arrow.svelte';
	import Glyph from '#lib/components/Glyph.svelte';
	import Qty from '#lib/components/Qty.svelte';
	import RequestForm from '#lib/components/RequestForm.svelte';
	import { tr } from '#lib/content.ts';
	import {
		OPTION_NAME,
		encodeList,
		linesOf,
		money,
		orderable,
		totals,
		type Line,
		type RequestSent
	} from '#lib/shop.ts';
	import { LOGO_MARK } from '#lib/brand.ts';
	import { useI18n, shopPath, listPdfPath } from '#lib/i18n.ts';
	import { list } from '#lib/list.svelte.ts';
	import { inview } from '#lib/motion.ts';
	import '#lib/sheet.css';

	// The visitor's list, checked against the shop as it is now. From here it can
	// be downloaded as a PDF, sent on WhatsApp, or sent to the team with the form.

	let { data, form } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.shop);
	const title = $derived(i18n.lines('shop.list.title'));

	const lines = $derived(linesOf(list.items, data.products));
	const ok = $derived(orderable(lines));
	const sum = $derived(totals(lines));
	const items = $derived(encodeList(ok.map((l) => ({ ...l.item, qty: l.qty }))));
	const pdf = (encoded: string, n?: number) =>
		`${listPdfPath(i18n.lang)}?l=${encodeURIComponent(encoded)}${n ? `&n=${n}` : ''}`;

	/** The list typed out for a WhatsApp message */
	const whatsapp = $derived.by(() => {
		if (!data.shop.whatsapp || !ok.length) return undefined;
		const w = t.whatsapp;
		const text = [
			w.hello,
			'',
			...ok.map((l) => {
				const p = l.product!;
				const what = [tr(p.name, i18n.lang), l.option && `(${l.option.label})`, p.ref && `ref. ${p.ref}`].filter(Boolean).join(' ');
				return `• ${l.qty} × ${what}: ${l.total === undefined ? w.request : money(l.total, i18n.lang)}`;
			}),
			'',
			w.total(money(sum.total, i18n.lang)),
			w.thanks
		].join('\n');
		return `https://wa.me/${data.shop.whatsapp}?text=${encodeURIComponent(text)}`;
	});

	const name = (l: Line) => (l.product ? tr(l.product.name, i18n.lang) : t.list.unknown);
	const detail = (l: Line) =>
		[
			l.option && `${tr(l.product!.optionName, i18n.lang) || OPTION_NAME[i18n.lang]}: ${l.option.label}`,
			l.product?.ref && `${t.ref} ${l.product.ref}`,
			l.product?.condition === 'used' && t.used
		]
			.filter(Boolean)
			.join(' · ');
	const problem = (l: Line) =>
		l.problem === 'less' ? t.list.problems.less(l.max) : l.problem ? t.list.problems[l.problem] : undefined;

	// Once the list has gone to the team it is cleared here, and the thanks stay on screen
	let sent = $state<RequestSent>();
	let thanks = $state<HTMLElement>();

	async function onsent(result: RequestSent) {
		sent = result;
		list.clear();
		await tick();
		thanks?.focus();
		scrollTo({ top: 0, behavior: 'smooth' });
	}

	function clear() {
		if (confirm(t.list.clearConfirm)) list.clear();
	}
</script>

<Meta title={t.listTitle} description={t.metaDescription} />
<svelte:head><meta name="robots" content="noindex" /></svelte:head>

<main>
	{#if sent}
		<section class="panel done-panel">
			<div class="wrap">
				<div class="sheet done">
					<div class="flag" aria-hidden="true"></div>
					<p class="kicker">{t.form.received}</p>
					<h1 class="display" tabindex="-1" bind:this={thanks}>{t.form.thanks(sent.name.split(' ')[0], sent.number)}</h1>
					<p class="reply">{t.form.reply(sent.email)}</p>
					<p class="after">
						<a class="ulink" href={pdf(sent.items, sent.number)} download>{t.form.pdf}</a>
						<a class="ulink" href={shopPath(i18n.lang)}>{t.form.again}</a>
					</p>
				</div>
			</div>
		</section>
	{:else}
		<header class="wrap head" use:inview>
			<p class="eyebrow rv">{i18n.text('shop.eyebrow')}</p>
			<h1 class="display">
				{#each title as line, i}
					<span class="line"><span class:accent={i === title.length - 1} style:--d="{60 + i * 90}ms">{line}</span></span>
				{/each}
			</h1>
			<p class="lead rv" style:--d="240ms">{i18n.text('shop.list.intro')}</p>
		</header>

		{#if !list.ready}
			<div class="wrap waiting" aria-hidden="true"></div>
		{:else if !list.items.length}
			<div class="wrap empty">
				<p class="big">{t.list.empty}</p>
				<p>{t.list.emptyMore}</p>
				<a class="btn" href={shopPath(i18n.lang)}>{t.list.browse} <Arrow /></a>
			</div>
		{:else}
			<div class="wrap body">
				<ul class="lines">
					{#each lines as l (l.key)}
						{@const message = problem(l)}
						<li class="line-item" class:bad={l.problem && l.problem !== 'less'}>
							<a class="thumb" href={l.product ? shopPath(i18n.lang, l.product.slug) : undefined} tabindex="-1" aria-hidden="true">
								{#if l.product?.photos[0]}
									<img src={l.product.photos[0]} alt="" loading="lazy" />
								{:else}
									<svg viewBox="0 0 261 136">{#each LOGO_MARK as d}<path {d} />{/each}</svg>
								{/if}
							</a>
							<div class="what">
								{#if l.product}
									<a class="name" href={shopPath(i18n.lang, l.product.slug)}>{name(l)}</a>
								{:else}
									<span class="name">{name(l)}</span>
								{/if}
								{#if detail(l)}<p class="detail">{detail(l)}</p>{/if}
								{#if message}<p class="problem">{message}</p>{/if}
							</div>
							{#if l.product && l.max > 0}
								<div class="count">
									<Qty small value={l.qty} max={l.max} label={name(l)} onchange={(n) => list.set(l.key, n)} />
									<span class="each">{l.unit === undefined ? '' : `${money(l.unit, i18n.lang)} / ${t.list.each.toLowerCase()}`}</span>
								</div>
								<p class="sum" class:request={l.total === undefined}>{l.total === undefined ? t.onRequest : money(l.total, i18n.lang)}</p>
							{/if}
							<button type="button" class="remove" onclick={() => list.remove(l.key)} aria-label={t.list.remove(name(l))}>
								<Glyph name="close" />
							</button>
						</li>
					{/each}
				</ul>

				<aside class="summary striped">
					<p class="k">{t.list.estimate}</p>
					<p class="v">{money(sum.total, i18n.lang)}</p>
					<p class="s">{t.vat}</p>
					{#if sum.onRequest}<p class="s">{t.list.plusRequest(sum.onRequest)}</p>{/if}

					{#if ok.length}
						<div class="ways">
							<a class="btn" href="#send">{t.list.email} <Arrow dir="down" /></a>
							{#if whatsapp}
								<a class="btn btn-ghost" href={whatsapp} target="_blank" rel="noopener">{t.list.whatsapp} <Glyph name="chat" /></a>
							{/if}
							<a class="btn btn-ghost" href={pdf(items)} download>{t.list.pdf} <Glyph name="download" /></a>
						</div>
					{/if}
					<p class="terms">{i18n.text('shop.terms')}</p>
					<button type="button" class="clear ulink" onclick={clear}>{t.list.clear}</button>
				</aside>
			</div>

			{#if ok.length}
				<section id="send" class="panel">
					<div class="wrap grid" use:inview>
						<div class="rv">
							<h2 class="display t-section">{t.list.ways}</h2>
							<p class="intro">{i18n.text('shop.list.send')}</p>
						</div>
						<div class="rv" style:--d="120ms">
							<RequestForm result={form?.request} {items} email={data.settings.email} {onsent} />
							<p class="privacy">{i18n.text('shop.list.privacy')}</p>
						</div>
					</div>
				</section>
			{/if}
		{/if}
	{/if}
</main>

<style>
	main {
		padding-bottom: 0;
	}
	.head {
		padding-block: var(--page-top) clamp(2.5rem, 5vw, 4rem);
	}
	h1 {
		margin-top: 1.6rem;
		font-size: var(--t-page);
	}
	.lead {
		max-width: 32rem;
		margin-top: 1.5rem;
	}
	.waiting {
		min-height: 40vh;
	}
	.empty {
		display: grid;
		justify-items: start;
		gap: 0.75rem;
		padding-bottom: var(--section);
		color: var(--fg-2);
	}
	.empty .big {
		font-size: var(--t-lead);
		font-weight: 700;
		color: var(--fg);
	}
	.empty .btn {
		margin-top: 1rem;
	}

	/* ---------- lines ---------- */
	.body {
		display: grid;
		gap: 2.5rem;
		padding-bottom: var(--section);
	}
	.lines {
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 2px solid var(--fg);
	}
	.line-item {
		position: relative;
		display: grid;
		grid-template-columns: 4.5rem minmax(0, 1fr) auto;
		grid-template-areas: 'thumb what what' 'thumb count sum';
		gap: 0.75rem 1rem;
		align-items: start;
		padding-block: 1.25rem;
		border-bottom: 1px solid var(--hair);
	}
	.thumb {
		grid-area: thumb;
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		overflow: hidden;
		background: var(--bg-2);
	}
	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.thumb svg {
		width: 55%;
		fill: rgb(255 255 255 / 0.06);
	}
	.what {
		grid-area: what;
		min-width: 0;
		/* Clear of the remove button in the corner */
		padding-right: 2rem;
	}
	.name {
		font-weight: 700;
		line-height: 1.3;
	}
	a.name:hover {
		color: var(--blue);
	}
	.detail {
		margin-top: 0.2rem;
		font-size: 0.8125rem;
		color: var(--fg-3);
	}
	.problem {
		margin-top: 0.4rem;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--lime);
	}
	.bad .name,
	.bad .thumb {
		opacity: 0.55;
	}
	.count {
		grid-area: count;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem 0.9rem;
	}
	.each {
		font-size: 0.8125rem;
		color: var(--fg-3);
	}
	.sum {
		grid-area: sum;
		align-self: center;
		font-weight: 800;
		font-stretch: 110%;
		font-variant-numeric: tabular-nums;
		text-align: right;
		white-space: nowrap;
	}
	.sum.request {
		max-width: 7rem;
		font-size: 0.8125rem;
		font-weight: 600;
		line-height: 1.3;
		color: var(--fg-2);
		white-space: normal;
	}
	.remove {
		position: absolute;
		top: 1rem;
		right: 0;
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		margin: -0.35rem -0.4rem 0 0;
		color: var(--fg-3);
		transition: color 0.3s;
	}
	.remove:hover {
		color: var(--fg);
	}
	.remove :global(svg) {
		width: 0.85rem;
	}

	/* ---------- summary ---------- */
	.summary {
		align-self: start;
		padding: 1.75rem 1.5rem 1.5rem;
		background: var(--bg-2);
	}
	.k {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-2);
	}
	.v {
		margin-top: 0.6rem;
		font-size: var(--t-figure);
		font-style: italic;
		font-stretch: 70%;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}
	.s {
		margin-top: 0.4rem;
		font-size: 0.8125rem;
		color: var(--fg-3);
	}
	.ways {
		display: grid;
		gap: 0.6rem;
		margin-top: 1.5rem;
	}
	.ways .btn {
		justify-content: space-between;
	}
	.terms {
		margin-top: 1.25rem;
		font-size: 0.8125rem;
		color: var(--fg-3);
	}
	.clear {
		margin-top: 1rem;
		font-size: 0.8125rem;
		color: var(--fg-2);
	}

	/* ---------- send ---------- */
	.panel {
		--fg: var(--black);
		--fg-2: rgb(10 10 11 / 0.7);
		padding-block: clamp(3rem, 6vw, 5rem) clamp(4rem, 8vw, 6rem);
		background: var(--lime);
		color: var(--black);
		scroll-margin-top: var(--nav-compact);
	}
	.panel :global(:focus-visible) {
		outline-color: var(--black);
	}
	.panel :global(::selection) {
		background: var(--black);
		color: var(--lime);
	}
	.grid {
		display: grid;
		gap: 2rem;
	}
	.intro {
		max-width: 26rem;
		margin-top: 1.25rem;
		color: var(--fg-2);
		font-size: 1.0625rem;
	}
	.privacy {
		max-width: 34rem;
		margin-top: 1.5rem;
		font-size: 0.8125rem;
		color: var(--fg-2);
	}

	/* ---------- sent ---------- */
	.done-panel {
		padding-top: var(--page-top);
		min-height: 70vh;
	}
	.done h1 {
		max-width: 40rem;
		font-size: var(--t-section);
		line-height: 0.95;
	}
	.done h1:focus {
		outline: none;
	}
	.after {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 2rem;
		margin-top: 1.75rem;
		font-weight: 700;
	}

	@media (min-width: 720px) {
		.line-item {
			grid-template-columns: 5.5rem minmax(0, 1fr) auto 7rem 2rem;
			grid-template-areas: 'thumb what count sum remove';
			align-items: center;
			gap: 1.5rem;
		}
		.count {
			flex-direction: column;
			align-items: flex-end;
		}
		.what {
			padding-right: 0;
		}
		.remove {
			position: static;
			grid-area: remove;
			margin: 0;
		}
	}
	@media (min-width: 1024px) {
		.body {
			grid-template-columns: minmax(0, 1fr) 22rem;
			gap: clamp(2.5rem, 5vw, 4.5rem);
		}
		.summary {
			position: sticky;
			top: calc(var(--nav-compact) + 2rem);
		}
		.grid {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1.75fr);
			gap: clamp(3.5rem, 7vw, 6rem);
		}
	}
</style>
