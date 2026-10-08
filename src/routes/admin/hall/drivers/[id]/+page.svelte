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

	const a = $derived(data.a);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	let accent = $derived(a.accent);
	let number = $derived(a.number || '');
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/hall"><Icon name="back" /> {t().nav.hall}</a>
		<h1 class="a-title">{data.isNew ? t().alumnus.new : `${a.first} ${a.last}`}</h1>
	</div>
	<span class="a-plate big {accent}" aria-hidden="true">{number || '?'}</span>
</header>

<form method="post" action="?/save" enctype="multipart/form-data" use:enhance={keep} novalidate>
	<div class="a-stack">
		<section class="a-card">
			<h2>{t().driver.card}</h2>
			<div class="a-fields">
				<TextField name="first" label={t().common.first} value={a.first} error={e.first} required />
				<TextField name="last" label={t().common.last} value={a.last} error={e.last} required />
				<TextField
					name="number"
					label={t().common.number}
					type="number"
					min="0"
					value={a.number || ''}
					error={e.number}
					oninput={(ev) => (number = Number(ev.currentTarget.value) || '')}
				/>
				<TextField name="categories" label={t().alumnus.categories} value={a.categories} error={e.categories} hint={t().alumnus.categoriesHint} required />
				<div class="a-field wide">
					<span class="a-label">{t().common.cardColour}</span>
					<div class="a-choices">
						<label class="a-choice">
							<input type="radio" name="accent" value="lime" checked={a.accent === 'lime'} onchange={() => (accent = 'lime')} />
							<span class="a-swatch" style:background="var(--lime)"></span> {t().common.lime}
						</label>
						<label class="a-choice">
							<input type="radio" name="accent" value="cyan" checked={a.accent === 'cyan'} onchange={() => (accent = 'cyan')} />
							<span class="a-swatch" style:background="var(--cyan)"></span> {t().common.cyan}
						</label>
					</div>
				</div>
			</div>
		</section>

		<section class="a-card">
			<h2>{t().alumnus.team}</h2>
			<p class="a-desc">{t().alumnus.teamDesc}</p>
			<div class="a-fields nums">
				<TextField name="from" label={t().alumnus.from} type="number" value={a.from} error={e.from} required />
				<TextField name="to" label={t().alumnus.to} type="number" value={a.to} error={e.to} required />
				<TextField name="starts" label={t().common.starts} type="number" min="0" value={a.record.starts} error={e.starts} />
				<TextField name="wins" label={t().common.wins} type="number" min="0" value={a.record.wins} error={e.wins} />
				<TextField name="podiums" label={t().common.podiums} type="number" min="0" value={a.record.podiums} error={e.podiums} />
				<TextField name="poles" label={t().common.poles} type="number" min="0" value={a.record.poles} error={e.poles} />
			</div>
		</section>

		<section class="a-card">
			<h2>{t().alumnus.legacy}</h2>
			<div class="a-fields">
				<LangField
					name="titles"
					label={t().alumnus.titles}
					value={a.titles}
					errors={e}
					rows={3}
					hint={t().alumnus.titlesHint}
					wide
				/>
				<LangField
					name="now"
					label={t().alumnus.now}
					value={a.now}
					errors={e}
					placeholder="Fórmula 4 Espanhola"
					wide
				/>
			</div>
		</section>

		<section class="a-card">
			<h2>{t().common.photo}</h2>
			<ImageField name="photo" label={t().common.portrait} current={a.photo} error={e.photo} />
		</section>
	</div>

	<SaveBar cancel="/admin/hall" label={data.isNew ? t().alumnus.create : undefined} rev={data.rev} />
</form>

{#if !data.isNew}
	<form class="a-danger a-card" method="post" action="?/delete" use:enhance={confirmFirst(t().alumnus.delConfirm(`${a.first} ${a.last}`))}>
		<div>
			<h2>{t().alumnus.del}</h2>
			<p class="a-desc">{t().alumnus.delDesc}</p>
		</div>
		<button class="btn btn-danger"><Icon name="trash" /> {t().alumnus.delBtn(a.first)}</button>
	</form>
{/if}

<style>
	.big {
		width: 4.5rem;
		height: 3.75rem;
		font-size: 2.2rem;
		border-radius: 8px;
	}
	.nums {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
	}
</style>
