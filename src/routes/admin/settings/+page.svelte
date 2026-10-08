<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import LangField from '#lib/admin/LangField.svelte';
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
			<h2>{t().settings.hero}</h2>
			<p class="a-desc">{t().settings.heroDesc}</p>
			<div class="a-fields">
				<LangField name="heroEyebrow" label={t().settings.eyebrow} value={s.heroEyebrow} errors={e} required wide />
				<LangField
					name="heroLines"
					label={t().settings.heroLines}
					value={s.heroLines}
					errors={e}
					rows={4}
					hint={t().settings.heroLinesHint}
					required
					wide
				/>
				<LangField name="heroLead" label={t().settings.heroLead} value={s.heroLead} errors={e} rows={3} required wide />
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
				<LangField
					name="seasonIntro"
					label={t().settings.seasonIntro}
					value={s.seasonIntro}
					errors={e}
					rows={2}
					hint={t().settings.seasonIntroHint}
					required
					wide
				/>
			</div>
		</section>

		<section class="a-card" id="packages">
			<h2>{t().settings.sponsorship}</h2>
			<p class="a-desc">{t().settings.sponsorshipDesc}</p>
			<div class="a-fields">
				<LangField name="partnersIntro" label={t().settings.partnersIntro} value={s.partnersIntro} errors={e} rows={2} required wide />
			</div>
			{#each s.packages as p, i (p.zone)}
				<fieldset class="pkg">
					<legend><span class="num">0{i + 1}</span> {t().settings.zones[p.zone]}</legend>
					<div class="a-fields">
						<LangField name="{p.zone}.title" label={t().settings.pkgName} value={p.title} errors={e} required />
						<LangField name="{p.zone}.tier" label={t().settings.tier} value={p.tier} errors={e} required />
						<LangField name="{p.zone}.body" label={t().settings.pkgBody} value={p.body} errors={e} rows={2} required wide />
					</div>
				</fieldset>
			{/each}
		</section>

		<section class="a-card">
			<h2>{t().settings.texts}</h2>
			<div class="a-fields">
				<LangField name="tryouts" label={t().settings.tryouts} value={s.tryouts} errors={e} rows={3} required wide />
				<LangField name="press" label={t().settings.press} value={s.press} errors={e} rows={2} required wide />
			</div>
		</section>
	</div>

	<SaveBar label={t().settings.saveBtn} rev={data.rev} />
</form>

<p class="a-help history">
	<Icon name="history" />
	<span>{t().settings.historyNote} <a href="/admin/history">{t().settings.historyLink}</a>.</span>
</p>

<style>
	.pkg {
		margin: 1.5rem 0 0;
		padding: 1.25rem 0 0;
		border: 0;
		border-top: 1px solid var(--hair);
	}
	legend {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		float: left;
		width: 100%;
		margin-bottom: 1rem;
		padding: 0;
		font-weight: 700;
	}
	legend .num {
		color: var(--lime);
	}
	.pkg .a-fields {
		clear: both;
	}
	.history {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: 2rem;
	}
	.history :global(svg) {
		flex-shrink: 0;
		width: 1rem;
		color: var(--lime);
	}
</style>
