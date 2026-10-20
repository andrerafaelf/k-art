<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import LangField from '#lib/admin/LangField.svelte';
	import PostBody from '#lib/admin/PostBody.svelte';
	import PhotosField from '#lib/admin/PhotosField.svelte';
	import SaveBar from '#lib/admin/SaveBar.svelte';
	import { keep, confirmFirst } from '#lib/admin/forms.ts';
	import { t, lang } from '#lib/admin/i18n.ts';
	import { CATEGORIES, CATEGORY_NAMES, moneyInput } from '#lib/shop.ts';

	let { data, form } = $props();

	const p = $derived(data.product);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	const name = $derived(p.name.pt || p.name.en);

	// Parts of the form that change what else is shown. They start from the
	// saved product, and again whenever a save brings it back.
	type Row = { id: string; label: string; stock: number; price: string };
	const blankRow = (): Row => ({ id: '', label: '', stock: 0, price: '' });

	let sized = $state(false);
	let rows = $state<Row[]>([]);
	let condition = $state<'new' | 'used'>('new');
	let fits = $state('');
	$effect.pre(() => {
		sized = p.options.length > 0;
		rows = p.options.map((o) => ({ id: o.id, label: o.label, stock: o.stock, price: moneyInput(o.price) }));
		condition = p.condition;
		fits = p.fits.join(', ');
	});

	function size(on: boolean) {
		if (on && !rows.length) rows = [blankRow()];
	}

	let fitsInput = $state<HTMLInputElement>();
	const chosen = $derived(new Set(fits.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)));

	function addFit(tag: string) {
		fits = [...fits.split(',').map((s) => s.trim()).filter(Boolean), tag].join(', ');
		fitsInput?.dispatchEvent(new Event('input', { bubbles: true }));
	}

	function mark(target: EventTarget | null) {
		(target as HTMLElement | null)?.closest('form')?.dispatchEvent(new Event('change', { bubbles: true }));
	}
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/shop"><Icon name="back" /> {t().nav.shop}</a>
		<h1 class="a-title">{data.isNew ? t().product.new : name}</h1>
	</div>
	{#if !data.isNew}
		<div class="a-actions">
			<a class="btn btn-ghost" href="/loja/{p.slug}" target="_blank" rel="noreferrer">
				{p.visible ? t().common.viewSite : t().news.preview} <Icon name={p.visible ? 'external' : 'eye'} />
			</a>
		</div>
	{/if}
</header>

<form method="post" action="?/save" enctype="multipart/form-data" use:enhance={keep} novalidate>
	<div class="a-stack">
		<section class="a-card">
			<h2>{t().product.about}</h2>
			<p class="a-desc">{t().product.aboutDesc}</p>
			<div class="a-fields">
				<LangField name="name" label={t().product.name} value={p.name} errors={e} maxlength={120} required wide />
				<div class="a-field">
					<label class="a-label" for="f-category">{t().product.category}</label>
					<select id="f-category" name="category" value={p.category}>
						{#each CATEGORIES as c}
							<option value={c}>{CATEGORY_NAMES[c][lang()]}</option>
						{/each}
					</select>
				</div>
				<TextField name="brand" label={t().product.brand} value={p.brand ?? ''} error={e.brand} hint={t().product.brandHint} maxlength={60} optional />
				<TextField name="ref" label={t().product.ref} value={p.ref ?? ''} error={e.ref} hint={t().product.refHint} maxlength={60} optional />
				<PostBody name="description" label={t().product.description} value={p.description} errors={e} hint={t().product.descriptionHint} rows={8} />
			</div>
		</section>

		<section class="a-card">
			<h2>{t().product.photos}</h2>
			<p class="a-desc">{t().product.photosDesc}</p>
			<PhotosField name="photos" label={t().product.photos} current={p.photos} max={data.maxPhotos} error={e.photos} />
		</section>

		<section class="a-card">
			<h2>{t().product.price}</h2>
			<p class="a-desc">{t().product.priceDesc}</p>
			<div class="a-fields">
				<TextField
					name="price"
					label={t().product.priceLabel}
					value={moneyInput(p.price)}
					error={e.price}
					hint={t().product.priceHint}
					inputmode="decimal"
					placeholder="45,00"
					optional
				/>
				<TextField
					name="was"
					label={t().product.was}
					value={moneyInput(p.was)}
					error={e.was}
					hint={t().product.wasHint}
					inputmode="decimal"
					optional
				/>
			</div>
		</section>

		<section class="a-card">
			<h2>{t().product.stock}</h2>
			<p class="a-desc">{t().product.stockDesc}</p>
			<div class="a-fields">
				<div class="a-field wide">
					<label class="a-switch">
						<input type="checkbox" name="hasOptions" bind:checked={sized} onchange={() => size(sized)} />
						{t().product.hasOptions}
					</label>
					<p class="a-hint">{t().product.hasOptionsHint}</p>
				</div>

				{#if sized}
					<LangField
						name="optionName"
						label={t().product.optionName}
						value={p.optionName}
						errors={e}
						maxlength={30}
						placeholder="Tamanho"
						hint={t().product.optionNameHint}
						wide
					/>
					<div class="a-field wide">
						<div class="options" role="table" aria-label={t().product.hasOptions}>
							<div class="row head" role="row">
								<span role="columnheader">{t().product.option}</span>
								<span role="columnheader">{t().product.optionStock}</span>
								<span role="columnheader">{t().product.optionPrice}</span>
								<span></span>
							</div>
							{#each rows as row, i}
								<div class="row" role="row">
									<input type="hidden" name="option.id" value={row.id} />
									<span role="cell">
										<input
											name="option.label"
											bind:value={row.label}
											maxlength={20}
											placeholder="M"
											aria-label="{t().product.option} {i + 1}"
											class:invalid={e[`option.${i}.label`]}
										/>
									</span>
									<span role="cell">
										<input
											name="option.stock"
											type="number"
											min="0"
											max="9999"
											bind:value={row.stock}
											aria-label="{t().product.optionStock} {row.label}"
											class:invalid={e[`option.${i}.stock`]}
										/>
									</span>
									<span role="cell">
										<input
											name="option.price"
											bind:value={row.price}
											inputmode="decimal"
											aria-label="{t().product.optionPrice} {row.label}"
											title={t().product.optionPriceHint}
											class:invalid={e[`option.${i}.price`]}
										/>
									</span>
									<button
										type="button"
										class="a-icon-btn danger"
										aria-label={t().product.removeOption(row.label)}
										onclick={(ev) => {
											rows.splice(i, 1);
											mark(ev.currentTarget);
										}}
									>
										<Icon name="trash" />
									</button>
									{#each ['label', 'stock', 'price'] as key}
										{#if e[`option.${i}.${key}`]}<p class="a-err row-err">{e[`option.${i}.${key}`]}</p>{/if}
									{/each}
								</div>
							{/each}
						</div>
						<button type="button" class="btn btn-ghost more" onclick={() => rows.push(blankRow())}>
							<Icon name="plus" />
							{t().product.addOption}
						</button>
						{#if e.options}<p class="a-err">{e.options}</p>{:else}<p class="a-hint">{t().product.optionPriceHint}.</p>{/if}
					</div>
				{:else}
					<TextField name="stock" label={t().product.units} type="number" min="0" max="9999" value={p.stock} error={e.stock} required />
				{/if}

				<div class="a-field wide">
					<label class="a-switch">
						<input type="checkbox" name="onOrder" checked={p.onOrder} />
						{t().product.onOrder}
					</label>
					<p class="a-hint">{t().product.onOrderHint}</p>
				</div>
			</div>
		</section>

		<section class="a-card">
			<h2>{t().product.condition}</h2>
			<p class="a-desc">{t().product.conditionDesc}</p>
			<div class="a-fields">
				<div class="a-field wide">
					<div class="a-choices" role="radiogroup" aria-label={t().product.condition}>
						<label class="a-choice">
							<input type="radio" name="condition" value="new" bind:group={condition} />
							{t().product.isNew}
						</label>
						<label class="a-choice">
							<input type="radio" name="condition" value="used" bind:group={condition} />
							{t().product.isUsed}
						</label>
					</div>
				</div>
				{#if condition === 'used'}
					<LangField
						name="conditionNote"
						label={t().product.conditionNote}
						value={p.conditionNote}
						errors={e}
						rows={2}
						maxlength={300}
						hint={t().product.conditionNoteHint}
						wide
					/>
				{/if}
				<div class="a-field wide" class:invalid={e.fits}>
					<label class="a-label" for="f-fits">{t().product.fits}<span class="opt">, {t().common.optional}</span></label>
					<input id="f-fits" name="fits" bind:value={fits} bind:this={fitsInput} placeholder="OTK, Rotax Max" />
					<div class="suggest">
						{#each data.fits.filter((x) => !chosen.has(x.toLowerCase())) as tag}
							<button type="button" class="a-chip" onclick={() => addFit(tag)}><Icon name="plus" /> {tag}</button>
						{/each}
					</div>
					{#if e.fits}<p class="a-err">{e.fits}</p>{:else}<p class="a-hint">{t().product.fitsHint}</p>{/if}
				</div>
			</div>
		</section>

		<section class="a-card">
			<h2>{t().product.publishing}</h2>
			<div class="a-fields">
				<div class="a-field wide">
					<label class="a-switch">
						<input type="checkbox" name="visible" checked={p.visible} />
						{t().product.visible}
					</label>
					<p class="a-hint">{t().product.visibleHint}</p>
				</div>
				<TextField
					name="slug"
					label={t().product.address}
					value={p.slug}
					error={e.slug}
					placeholder={t().product.addressPlaceholder}
					hint={p.slug ? t().product.addressHint(p.slug) : t().product.addressEmpty}
					optional
				/>
			</div>
		</section>
	</div>

	<SaveBar cancel="/admin/shop" label={data.isNew ? t().product.create : undefined} rev={data.rev} />
</form>

{#if !data.isNew}
	<form class="a-card a-danger copy" method="post" action="?/duplicate" use:enhance>
		<div>
			<h2>{t().product.duplicate}</h2>
			<p class="a-desc">{t().product.duplicateDesc}</p>
		</div>
		<button class="btn btn-ghost"><Icon name="copy" /> {t().product.duplicate}</button>
	</form>
	<form class="a-danger a-card tight" method="post" action="?/delete" use:enhance={confirmFirst(t().product.delConfirm(name))}>
		<div>
			<h2>{t().product.del}</h2>
			<p class="a-desc">{t().product.delDesc}</p>
		</div>
		<button class="btn btn-danger"><Icon name="trash" /> {t().product.del}</button>
	</form>
{/if}

<style>
	.options {
		display: grid;
		gap: 0.5rem;
	}
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1.2fr) 2.25rem;
		gap: 0.5rem;
		align-items: center;
	}
	.row.head {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--fg-3);
	}
	.row input {
		width: 100%;
	}
	.row-err {
		grid-column: 1 / -1;
		margin-top: -0.2rem;
	}
	.more {
		justify-self: start;
		margin-top: 0.75rem;
	}
	.suggest {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.6rem;
	}
	.suggest .a-chip {
		border: 0;
		cursor: pointer;
		font: inherit;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: none;
		transition:
			background 0.2s,
			color 0.2s;
	}
	.suggest .a-chip:hover {
		background: rgb(214 249 6 / 0.14);
		color: var(--lime);
	}
	.suggest :global(svg) {
		width: 0.7rem;
	}
	.copy {
		border-color: var(--hair);
	}
</style>
