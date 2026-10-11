<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import SaveBar from '#lib/admin/SaveBar.svelte';
	import { keep } from '#lib/admin/forms.ts';
	import { t } from '#lib/admin/i18n.ts';

	let { data, form } = $props();

	const s = $derived(data.settings);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">{t().common.team}</p>
		<h1 class="a-title">{t().nav.settings}</h1>
		<p class="a-lede">{t().settings.lede}</p>
	</div>
</header>

<form method="post" action="?/save" use:enhance={keep} novalidate>
	<div class="a-stack">
		<section class="a-card">
			<h2>{t().settings.contact}</h2>
			<p class="a-desc">{t().settings.contactDesc}</p>
			<div class="a-fields">
				<TextField name="email" label={t().settings.email} type="email" value={s.email} error={e.email} required />
				<TextField
					name="instagram"
					label={t().settings.instagram}
					value={s.instagram}
					error={e.instagram}
					hint={t().settings.instagramHint}
					required
				/>
				<TextField
					name="location"
					label={t().settings.location}
					value={s.location}
					error={e.location}
					hint={t().settings.locationHint}
					required
				/>
			</div>
		</section>

		<section class="a-card">
			<h2>{t().settings.season}</h2>
			<div class="a-fields">
				<TextField
					name="seasonYear"
					label={t().settings.seasonYear}
					type="number"
					value={s.seasonYear}
					error={e.seasonYear}
					hint={t().settings.seasonYearHint}
					required
				/>
			</div>
		</section>
	</div>

	<SaveBar label={t().settings.saveBtn} rev={data.rev} />
</form>

<p class="a-help history">
	<Icon name="texts" />
	<span>{t().settings.textsNote} <a href="/admin/texts">{t().nav.texts}</a>.</span>
</p>

<p class="a-help history">
	<Icon name="history" />
	<span>{t().settings.historyNote} <a href="/admin/history">{t().settings.historyLink}</a>.</span>
</p>

<style>
	.history {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: 2rem;
	}
	.history + .history {
		margin-top: 0.75rem;
	}
	.history :global(svg) {
		flex-shrink: 0;
		width: 1rem;
		color: var(--lime);
	}
</style>
