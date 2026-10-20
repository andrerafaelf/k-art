<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import { confirmFirst } from '#lib/admin/forms.ts';
	import { t, lang } from '#lib/admin/i18n.ts';
	import { categoryName, isDemo, money, phoneDisplay, priceRange, stockOf, stockState } from '#lib/shop.ts';

	let { data, form } = $props();

	const on = $derived(data.shop.enabled);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	const examples = $derived(data.products.filter(isDemo).length);

	// Switching off always asks; switching on asks only while example products are
	// still in. Decided on each click, since the same button does both.
	const toggle: SubmitFunction = ({ cancel }) => {
		const question = on ? t().shop.switchOffConfirm : examples ? t().shop.switchOnDemo(examples) : undefined;
		if (question && !confirm(question)) return cancel();
		return async ({ update }) => update();
	};

	let query = $state('');
	const fold = (s: string) =>
		s
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase();
	const shown = $derived.by(() => {
		const words = fold(query).split(/\s+/).filter(Boolean);
		if (!words.length) return data.products;
		return data.products.filter((p) => {
			const text = fold([p.name.pt, p.name.en, p.brand, p.ref, categoryName(p.category, lang())].join(' '));
			return words.every((w) => text.includes(w));
		});
	});

	const price = (p: (typeof data.products)[number]) => {
		const r = priceRange(p);
		return r.min === undefined ? t().shop.onRequest : r.varies ? t().shop.from(money(r.min, lang())) : money(r.min, lang());
	};
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">{t().common.team}</p>
		<h1 class="a-title">{t().nav.shop}</h1>
		<p class="a-lede">{t().shop.lede}</p>
	</div>
	<div class="a-actions">
		<a class="btn btn-ghost" href="/loja" target="_blank" rel="noreferrer">
			{on ? t().shop.view : t().shop.preview} <Icon name={on ? 'external' : 'eye'} />
		</a>
		<a class="btn" href="/admin/shop/new"><Icon name="plus" /> {t().shop.add}</a>
	</div>
</header>

<section class="a-card status" class:on>
	<div class="state">
		<span class="light" aria-hidden="true"></span>
		<div>
			<h2>{t().shop.status}: <strong>{on ? t().shop.on : t().shop.off}</strong></h2>
			<p class="a-desc">{on ? t().shop.onDesc('k-artracing.com/loja') : t().shop.offDesc}</p>
		</div>
		<form method="post" action="?/toggle" use:enhance={toggle}>
			<input type="hidden" name="on" value={on ? '' : '1'} />
			<button class="btn" class:btn-ghost={on}>{on ? t().shop.switchOff : t().shop.switchOn}</button>
		</form>
	</div>

	<form class="wa" method="post" action="?/whatsapp" use:enhance={() => async ({ update }) => update({ reset: false })} novalidate>
		<TextField
			name="whatsapp"
			label={t().shop.whatsapp}
			type="tel"
			value={phoneDisplay(data.shop.whatsapp)}
			placeholder="+351 912 345 678"
			error={e.whatsapp}
			hint={t().shop.whatsappHint}
			optional
		/>
		<button class="btn btn-ghost">{t().shop.saveWhatsapp}</button>
	</form>
</section>

{#if examples}
	<form class="a-card demo" method="post" action="?/undemo" use:enhance={confirmFirst(t().shop.demoRemoveConfirm)}>
		<Icon name="alert" />
		<p>{t().shop.demoNote(examples)}</p>
		<button class="btn btn-ghost"><Icon name="trash" /> {t().shop.demoRemove}</button>
	</form>
{/if}

{#if data.products.length}
	<label class="find">
		<Icon name="search" />
		<span class="sr-only">{t().shop.search}</span>
		<input type="search" bind:value={query} placeholder={t().shop.search} />
	</label>

	{#if shown.length}
		<ul class="a-list">
			{#each shown as p (p.id)}
				{@const i = data.products.indexOf(p)}
				{@const stock = stockOf(p)}
				{@const state = stockState(stock, p.onOrder)}
				{@const name = p.name.pt || p.name.en}
				<li class="a-row prod" class:hidden={!p.visible}>
					{#if p.photos[0]}
						<img class="a-thumb sq" src={p.photos[0]} alt="" />
					{:else}
						<span class="a-thumb sq blank"><Icon name="shop" /></span>
					{/if}
					<span class="grow">
						<a class="name" href="/admin/shop/{p.id}">{name}</a>
						<span class="meta"
							>{categoryName(p.category, lang())} · {price(p)}{#if p.options.length}
								· {t().shop.sizes(p.options.length)}{/if}</span
						>
					</span>
					<span class="side">
						<span class="chips">
							{#if isDemo(p)}<span class="a-chip example">{t().shop.demoChip}</span>{/if}
							{#if !p.visible}<span class="a-chip">{t().shop.hidden}</span>{/if}
							<span class="a-chip" class:ok={state === 'in'} class:warn={state === 'low' || state === 'out'}>
								{state === 'in'
									? t().shop.inStock(stock)
									: state === 'low'
										? t().shop.low(stock)
										: state === 'order'
											? t().shop.onOrder
											: t().shop.soldOut}
							</span>
						</span>
						{#if !p.options.length}
							<form class="stepper" method="post" action="?/stock" use:enhance>
								<input type="hidden" name="id" value={p.id} />
								<button class="a-icon-btn" name="dir" value="down" disabled={p.stock === 0} aria-label={t().shop.less(name)}>
									<Icon name="minus" />
								</button>
								<button class="a-icon-btn" name="dir" value="up" aria-label={t().shop.more(name)}>
									<Icon name="plus" />
								</button>
							</form>
						{/if}
						<span class="tools">
							{#if !query}
								<form method="post" action="?/move" use:enhance>
									<input type="hidden" name="id" value={p.id} />
									<button class="a-icon-btn" name="dir" value="up" disabled={i === 0} aria-label={t().common.up(name)}>
										<Icon name="up" />
									</button>
									<button
										class="a-icon-btn"
										name="dir"
										value="down"
										disabled={i === data.products.length - 1}
										aria-label={t().common.down(name)}
									>
										<Icon name="down" />
									</button>
								</form>
							{/if}
							<a class="a-icon-btn" href="/admin/shop/{p.id}" aria-label={t().common.edit(name)}><Icon name="edit" /></a>
						</span>
					</span>
				</li>
			{/each}
		</ul>
	{:else}
		<div class="a-list a-empty"><p>{t().shop.noMatch}</p></div>
	{/if}
{:else}
	<div class="a-list a-empty">
		<p>{t().shop.empty}</p>
		<a class="btn" href="/admin/shop/new"><Icon name="plus" /> {t().shop.addFirst}</a>
		<form class="try" method="post" action="?/demo" use:enhance>
			<p class="a-help">{t().shop.demoTryDesc}</p>
			<button class="btn btn-ghost"><Icon name="shop" /> {t().shop.demoTry}</button>
		</form>
	</div>
{/if}

<p class="a-help note">
	<Icon name="texts" />
	<span>{t().shop.textsNote} <a href="/admin/texts/shop">{t().nav.texts}</a>.</span>
</p>

<style>
	/* ---------- on or off ---------- */
	.status {
		margin-bottom: 1.5rem;
	}
	.state {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 1rem 1.25rem;
	}
	.state > div {
		flex: 1 1 18rem;
	}
	.state h2 {
		margin-bottom: 0.35rem;
	}
	.state strong {
		color: var(--fg-2);
	}
	.on .state strong {
		color: var(--lime);
	}
	.light {
		flex-shrink: 0;
		width: 0.7rem;
		height: 0.7rem;
		margin-top: 0.45rem;
		border-radius: 50%;
		box-shadow: inset 0 0 0 2px var(--fg-3);
	}
	.on .light {
		background: var(--lime);
		box-shadow: 0 0 0 4px rgb(214 249 6 / 0.15);
	}
	.state form {
		align-self: center;
	}
	.wa {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 0.75rem 1rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--hair);
	}
	.wa :global(.a-field) {
		flex: 1 1 18rem;
	}
	.wa .btn {
		margin-top: 1.6rem;
	}

	/* ---------- example products ---------- */
	.demo {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1rem;
		margin-bottom: 1.5rem;
		border-color: rgb(255 181 71 / 0.35);
	}
	.demo > :global(svg) {
		flex-shrink: 0;
		width: 1.2rem;
		color: var(--warn);
	}
	.demo p {
		flex: 1 1 20rem;
	}
	.example {
		background: rgb(255 181 71 / 0.12);
		color: var(--warn);
	}
	.try {
		display: grid;
		justify-items: center;
		gap: 0.75rem;
		max-width: 30rem;
		margin: 2rem auto 0;
		padding-top: 1.5rem;
		border-top: 1px solid var(--hair);
	}

	/* ---------- products ---------- */
	.find {
		position: relative;
		display: block;
		margin-bottom: 0.75rem;
	}
	.find :global(svg) {
		position: absolute;
		z-index: 1;
		top: 50%;
		left: 0.85rem;
		width: 1rem;
		translate: 0 -50%;
		color: var(--fg-3);
		pointer-events: none;
	}
	/* Specific enough to beat the admin's input style whichever stylesheet loads last */
	.find input[type='search'] {
		padding-left: 2.5rem;
	}
	.sq {
		width: 2.9rem;
		height: 2.9rem;
	}
	.blank {
		display: grid;
		place-items: center;
		color: var(--fg-3);
	}
	.blank :global(svg) {
		width: 1.1rem;
	}
	.prod {
		flex-wrap: wrap;
	}
	.prod .grow {
		flex: 1 1 12rem;
	}
	.hidden .name,
	.hidden img {
		opacity: 0.5;
	}
	.side {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-left: auto;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.stepper {
		display: flex !important;
		gap: 0.15rem;
	}
	/* Phones: the labels on a line of their own under the name, then one row of
	   buttons, stock on the left and order and edit on the right */
	@media (max-width: 640px) {
		.side {
			flex-basis: 100%;
			justify-content: flex-start;
			padding-left: 3.9rem;
		}
		.chips {
			flex-basis: 100%;
		}
		.side .tools {
			margin-left: auto;
		}
	}
	.note {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: 2rem;
	}
	.note :global(svg) {
		flex-shrink: 0;
		width: 1rem;
		color: var(--lime);
	}
</style>
