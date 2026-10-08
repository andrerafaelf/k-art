<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import LangField from '#lib/admin/LangField.svelte';
	import { keep, confirmFirst } from '#lib/admin/forms.ts';

	let { data, form } = $props();

	const s = $derived(data.s);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/hall"><Icon name="back" /> Hall of Fame</a>
		<h1 class="a-title">{data.isNew ? `Season ${s.year}` : `${s.year}`}</h1>
		{#if data.fromCalendar}
			<p class="a-lede">
				Rounds, wins, podiums and the line-up are filled in from this year's calendar and drivers.
				Add the poles, a headline and any titles, then save.
			</p>
		{/if}
	</div>
</header>

<form method="post" action="?/save" use:enhance={keep} novalidate>
	<div class="a-stack">
		<section class="a-card">
			<h2>The season</h2>
			<div class="a-fields">
				<TextField name="year" label="Year" type="number" value={s.year} error={e.year} required />
				<LangField
					name="headline"
					label="Headline"
					value={s.headline}
					errors={e}
					maxlength={60}
					placeholder="Campeões regionais"
					required
					wide
				/>
				<LangField name="summary" label="Story of the season" value={s.summary} errors={e} rows={3} wide />
			</div>
		</section>

		<section class="a-card">
			<h2>Numbers</h2>
			<p class="a-desc">Team totals for the year, all drivers together.</p>
			<div class="a-fields nums">
				<TextField name="rounds" label="Rounds" type="number" min="0" value={s.stats.rounds} error={e.rounds} />
				<TextField name="wins" label="Wins" type="number" min="0" value={s.stats.wins} error={e.wins} />
				<TextField name="podiums" label="Podiums" type="number" min="0" value={s.stats.podiums} error={e.podiums} />
				<TextField name="poles" label="Pole positions" type="number" min="0" value={s.stats.poles} error={e.poles} />
			</div>
		</section>

		<section class="a-card">
			<h2>Titles and line-up</h2>
			<div class="a-fields">
				<LangField
					name="titles"
					label="Titles and highlights"
					value={s.titles}
					errors={e}
					rows={4}
					hint="One per line, for example: Beatriz Gouveia, Campeã Regional da Madeira, Júnior X30. Each line counts as a title on the site."
					wide
				/>
				<TextField
					name="lineup"
					label="Line-up"
					value={s.lineup}
					error={e.lineup}
					hint="Surnames, separated by commas"
					optional
					wide
				/>
			</div>
		</section>
	</div>

	<div class="a-savebar">
		<span class="a-help">Changes go live on the site as soon as you save.</span>
		<div class="a-actions">
			<a class="btn btn-ghost" href="/admin/hall">Cancel</a>
			<button class="btn">{data.isNew ? 'Add to the Hall of Fame' : 'Save changes'}</button>
		</div>
	</div>
</form>

{#if !data.isNew}
	<form class="a-danger a-card" method="post" action="?/delete" use:enhance={confirmFirst(`Remove ${s.year} from the Hall of Fame?`)}>
		<div>
			<h2>Remove season</h2>
			<p class="a-desc">Takes it off the site. An earlier version can be restored from site settings.</p>
		</div>
		<button class="btn btn-danger"><Icon name="trash" /> Remove {s.year}</button>
	</form>
{/if}

<style>
	.nums {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
	}
</style>
