<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import LangField from '#lib/admin/LangField.svelte';
	import SaveBar from '#lib/admin/SaveBar.svelte';
	import { keep, confirmFirst } from '#lib/admin/forms.ts';
	import { t } from '#lib/admin/i18n.ts';

	let { data, form } = $props();

	const s = $derived(data.s);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/hall"><Icon name="back" /> {t().nav.hall}</a>
		<h1 class="a-title">{data.isNew ? t().archive.title(s.year) : `${s.year}`}</h1>
		{#if data.fromCalendar}
			<p class="a-lede">{t().archive.fromCalendar}</p>
		{/if}
	</div>
</header>

<form method="post" action="?/save" use:enhance={keep} novalidate>
	<div class="a-stack">
		<section class="a-card">
			<h2>{t().archive.season}</h2>
			<div class="a-fields">
				<TextField name="year" label={t().archive.year} type="number" value={s.year} error={e.year} required />
				<LangField
					name="headline"
					label={t().archive.headline}
					value={s.headline}
					errors={e}
					maxlength={60}
					placeholder="Campeões regionais"
					required
					wide
				/>
				<LangField name="summary" label={t().archive.summary} value={s.summary} errors={e} rows={3} wide />
			</div>
		</section>

		<section class="a-card">
			<h2>{t().archive.numbers}</h2>
			<p class="a-desc">{t().archive.numbersDesc}</p>
			<div class="a-fields nums">
				<TextField name="rounds" label={t().archive.rounds} type="number" min="0" value={s.stats.rounds} error={e.rounds} />
				<TextField name="wins" label={t().common.wins} type="number" min="0" value={s.stats.wins} error={e.wins} />
				<TextField name="podiums" label={t().common.podiums} type="number" min="0" value={s.stats.podiums} error={e.podiums} />
				<TextField name="poles" label={t().common.poles} type="number" min="0" value={s.stats.poles} error={e.poles} />
			</div>
		</section>

		<section class="a-card">
			<h2>{t().archive.titlesLineup}</h2>
			<div class="a-fields">
				<LangField
					name="titles"
					label={t().archive.titles}
					value={s.titles}
					errors={e}
					rows={4}
					hint={t().archive.titlesHint}
					wide
				/>
				<TextField
					name="lineup"
					label={t().archive.lineup}
					value={s.lineup}
					error={e.lineup}
					hint={t().archive.lineupHint}
					optional
					wide
				/>
			</div>
		</section>
	</div>

	<SaveBar cancel="/admin/hall" label={data.isNew ? t().archive.create : undefined} rev={data.rev} />
</form>

{#if !data.isNew}
	<form class="a-danger a-card" method="post" action="?/delete" use:enhance={confirmFirst(t().archive.delConfirm(s.year))}>
		<div>
			<h2>{t().archive.del}</h2>
			<p class="a-desc">{t().archive.delDesc}</p>
		</div>
		<button class="btn btn-danger"><Icon name="trash" /> {t().archive.delBtn(s.year)}</button>
	</form>
{/if}

<style>
	.nums {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
	}
</style>
