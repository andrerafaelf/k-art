<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import LangField from '#lib/admin/LangField.svelte';
	import ImageField from '#lib/admin/ImageField.svelte';
	import SaveBar from '#lib/admin/SaveBar.svelte';
	import { keep, confirmFirst } from '#lib/admin/forms.ts';
	import { t } from '#lib/admin/i18n.ts';

	let { data, form } = $props();

	const p = $derived(data.pilot);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	const name = $derived(data.isNew ? t().driver.new : `${p.first} ${p.last}`);

	// Live preview of the race plate
	let number = $derived(p.number || '');
	let accent = $derived(p.accent);
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/drivers"><Icon name="back" /> {t().nav.drivers}</a>
		<h1 class="a-title">{name}</h1>
	</div>
	<span class="a-plate big {accent}" aria-hidden="true">{number || '?'}</span>
</header>

<form method="post" action="?/save" enctype="multipart/form-data" use:enhance={keep} novalidate>
	<div class="a-stack">
		<section class="a-card">
			<h2>{t().driver.card}</h2>
			<p class="a-desc">{t().driver.cardDesc}</p>
			<div class="a-fields">
				<TextField name="first" label={t().common.first} value={p.first} error={e.first} maxlength={40} required />
				<TextField name="last" label={t().common.last} value={p.last} error={e.last} maxlength={40} required />
				<TextField
					name="number"
					label={t().common.number}
					type="number"
					min="0"
					max="999"
					value={p.number || ''}
					error={e.number}
					oninput={(ev) => (number = Number(ev.currentTarget.value) || '')}
					required
				/>
				<TextField
					name="category"
					label={t().driver.category}
					value={p.category}
					error={e.category}
					list="categories"
					hint={t().driver.categoryHint}
					required
				/>
				<datalist id="categories">
					{#each data.categories as c}<option value={c}></option>{/each}
				</datalist>
				<div class="a-field wide">
					<span class="a-label">{t().common.cardColour}</span>
					<div class="a-choices">
						<label class="a-choice">
							<input type="radio" name="accent" value="lime" checked={p.accent === 'lime'} onchange={() => (accent = 'lime')} />
							<span class="a-swatch" style:background="var(--lime)"></span> {t().common.lime}
						</label>
						<label class="a-choice">
							<input type="radio" name="accent" value="cyan" checked={p.accent === 'cyan'} onchange={() => (accent = 'cyan')} />
							<span class="a-swatch" style:background="var(--blue)"></span> {t().common.cyan}
						</label>
					</div>
				</div>
			</div>
		</section>

		<section class="a-card">
			<h2>{t().driver.profile}</h2>
			<div class="a-fields">
				<TextField name="age" label={t().driver.age} type="number" min="4" max="99" value={p.age || ''} error={e.age} required />
				<TextField name="hometown" label={t().driver.hometown} value={p.hometown} error={e.hometown} optional />
				<TextField name="since" label={t().driver.since} type="number" min="1950" value={p.since} error={e.since} required />
				<TextField name="chassis" label={t().driver.chassis} value={p.chassis} error={e.chassis} optional />
				<TextField name="engine" label={t().driver.engine} value={p.engine} error={e.engine} optional />
			</div>
		</section>

		<section class="a-card">
			<h2>{t().driver.record}</h2>
			<p class="a-desc">{t().driver.recordDesc}</p>
			<div class="a-fields record">
				<TextField name="starts" label={t().common.starts} type="number" min="0" value={p.record.starts} error={e.starts} />
				<TextField name="wins" label={t().common.wins} type="number" min="0" value={p.record.wins} error={e.wins} />
				<TextField name="podiums" label={t().common.podiums} type="number" min="0" value={p.record.podiums} error={e.podiums} />
				<TextField name="poles" label={t().common.poles} type="number" min="0" value={p.record.poles} error={e.poles} />
			</div>
		</section>

		<section class="a-card">
			<h2>{t().driver.words}</h2>
			<p class="a-desc">{t().driver.wordsDesc}</p>
			<div class="a-fields">
				<LangField
					name="best"
					label={t().driver.best}
					value={p.best}
					errors={e}
					maxlength={120}
					placeholder="P2, Campeonato de Portugal 2025"
					wide
				/>
				<LangField name="quote" label={t().driver.quote} value={p.quote} errors={e} maxlength={200} rows={2} wide />
			</div>
		</section>

		<section class="a-card">
			<h2>{t().common.photo}</h2>
			<p class="a-desc">{t().driver.photoDesc}</p>
			<ImageField name="photo" label={t().common.portrait} current={p.photo} error={e.photo} />
		</section>
	</div>

	<SaveBar cancel="/admin/drivers" label={data.isNew ? t().driver.create : undefined} rev={data.rev} />
</form>

{#if !data.isNew}
	<form
		class="retire a-card"
		method="post"
		action="?/retire"
		use:enhance={confirmFirst(t().driver.retireConfirm(`${p.first} ${p.last}`))}
	>
		<div>
			<h2>{t().driver.retire}</h2>
			<p class="a-desc">{t().driver.retireDesc}</p>
		</div>
		<button class="btn btn-ghost"><Icon name="trophy" /> {t().driver.retireBtn(p.first)}</button>
	</form>

	<form
		class="a-danger a-card tight"
		method="post"
		action="?/delete"
		use:enhance={confirmFirst(t().driver.removeConfirm(`${p.first} ${p.last}`))}
	>
		<div>
			<h2>{t().driver.remove}</h2>
			<p class="a-desc">{t().driver.removeDesc}</p>
		</div>
		<button class="btn btn-danger"><Icon name="trash" /> {t().driver.removeBtn(p.first)}</button>
	</form>
{/if}

<style>
	.retire {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 3rem;
	}
	.retire .a-desc {
		margin-bottom: 0;
	}
	.big {
		width: 4.5rem;
		height: 3.75rem;
		font-size: 2.2rem;
		border-radius: 8px;
	}
	.record {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
	}
</style>
