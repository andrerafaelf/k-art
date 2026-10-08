<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import ImageField from '#lib/admin/ImageField.svelte';
	import SaveBar from '#lib/admin/SaveBar.svelte';
	import { keep, confirmFirst } from '#lib/admin/forms.ts';
	import { t } from '#lib/admin/i18n.ts';

	let { data, form } = $props();

	const p = $derived(data.partner);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	let tone = $derived(p.tone);
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/partners"><Icon name="back" /> {t().nav.partners}</a>
		<h1 class="a-title">{data.isNew ? t().partner.new : p.name}</h1>
	</div>
</header>

<form method="post" action="?/save" enctype="multipart/form-data" use:enhance={keep} novalidate>
	<section class="a-card">
		<div class="a-fields">
			<TextField name="name" label={t().partner.name} value={p.name} error={e.name} maxlength={60} required />
			<TextField
				name="url"
				label={t().partner.website}
				value={p.url ?? ''}
				error={e.url}
				placeholder="https://"
				hint={t().partner.websiteHint}
				optional
			/>
			<div class="a-field wide">
				<span class="a-label">{t().partner.tile}</span>
				<div class="a-choices">
					<label class="a-choice">
						<input type="radio" name="tone" value="dark" checked={p.tone === 'dark'} onchange={() => (tone = 'dark')} />
						<span class="a-swatch" style:background="#0e0f11" style:box-shadow="inset 0 0 0 1px var(--hair-2)"></span>
						{t().partner.dark}
					</label>
					<label class="a-choice">
						<input type="radio" name="tone" value="light" checked={p.tone === 'light'} onchange={() => (tone = 'light')} />
						<span class="a-swatch" style:background="#efeee9"></span>
						{t().partner.light}
					</label>
				</div>
			</div>
			<ImageField
				name="logo"
				label={t().partner.logo}
				current={p.logo || undefined}
				error={e.logo}
				removable={false}
				svg
				{tone}
				hint={t().partner.logoHint}
				wide
			/>
		</div>
	</section>

	<SaveBar cancel="/admin/partners" label={data.isNew ? t().partner.create : undefined} rev={data.rev} />
</form>

{#if !data.isNew}
	<form class="a-danger a-card" method="post" action="?/delete" use:enhance={confirmFirst(t().partner.delConfirm(p.name))}>
		<div>
			<h2>{t().partner.del}</h2>
			<p class="a-desc">{t().partner.delDesc}</p>
		</div>
		<button class="btn btn-danger"><Icon name="trash" /> {t().partner.delBtn}</button>
	</form>
{/if}
