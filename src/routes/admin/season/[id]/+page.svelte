<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import LangField from '#lib/admin/LangField.svelte';
	import SaveBar from '#lib/admin/SaveBar.svelte';
	import { keep, confirmFirst } from '#lib/admin/forms.ts';
	import { t, lang } from '#lib/admin/i18n.ts';
	import { roundEnd, longRange, RACE_DAYS } from '#lib/content.ts';

	let { data, form } = $props();

	const r = $derived(data.round);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	const title = $derived(data.isNew ? t().round.new : t().round.title((r as { round?: number }).round ?? 0, r.location));

	// Editable list of results, reset from the saved round after every load
	const fromSaved = () => data.round.results.map((x) => ({ pilotId: x.pilotId, pos: String(x.pos), name: x.name }));
	let rows = $state(fromSaved());
	$effect(() => {
		rows = fromSaved();
	});
	const finished = $derived(!!r.date && roundEnd(r) <= Date.now());

	// The weekend spelled out under the length, so it's easy to check before saving
	let date = $derived(r.date);
	let days = $derived(r.days);
	const spelled = $derived(date ? longRange({ date, days }, lang(), { year: false, weekday: true }) : '');

	const add = () => (rows = [...rows, { pilotId: '', pos: '', name: '' }]);
	const remove = (i: number) => (rows = rows.filter((_, j) => j !== i));
	// Drivers who have left the team still show by name on their old results
	const known = (id: string) => data.pilots.some((p) => p.id === id);
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/season"><Icon name="back" /> {t().nav.season}</a>
		<h1 class="a-title">{title}</h1>
	</div>
</header>

<form method="post" action="?/save" use:enhance={keep} novalidate>
	<div class="a-stack">
		<section class="a-card">
			<h2>{t().round.weekend}</h2>
			<p class="a-desc">{t().round.weekendDesc}</p>
			<div class="a-fields">
				<TextField
					name="date"
					label={t().round.date}
					type="date"
					value={r.date}
					error={e.date}
					oninput={(ev) => (date = ev.currentTarget.value)}
					required
				/>
				<div class="a-field">
					<span class="a-label">{t().round.days}</span>
					<div class="a-choices days">
						{#each RACE_DAYS as n}
							<label class="a-choice">
								<input type="radio" name="days" value={n} checked={r.days === n} onchange={() => (days = n)} />
								{t().round.daysOption(n)}
							</label>
						{/each}
					</div>
					{#if spelled}
						<p class="a-hint spelled">{spelled}</p>
					{:else}
						<p class="a-hint">{t().round.daysHint}</p>
					{/if}
				</div>
				<TextField
					name="location"
					label={t().round.location}
					value={r.location}
					error={e.location}
					list="locations"
					hint={t().round.locationHint}
					required
				/>
				<datalist id="locations">
					{#each data.locations as l}<option value={l}></option>{/each}
				</datalist>
				<LangField name="venue" label={t().round.circuit} value={r.venue} errors={e} required wide />
				<LangField
					name="series"
					label={t().round.series}
					value={r.series}
					errors={e}
					hint={t().round.seriesHint}
					required
					wide
				/>
			</div>
		</section>

		<section class="a-card">
			<h2>{t().round.results}</h2>
			<p class="a-desc">{t().round.resultsDesc}</p>

			{#if rows.length}
				<ol class="results">
					{#each rows as row, i}
						<li class:invalid={e[`result_${i}`]}>
							<span class="n num">{i + 1}</span>
							<select name="result_pilot" aria-label={t().round.driver} bind:value={row.pilotId}>
								<option value="">{t().round.choose}</option>
								{#each data.pilots as p}
									<option value={p.id}>{p.name}, {p.category}</option>
								{/each}
								{#if row.pilotId && !known(row.pilotId)}
									<option value={row.pilotId}>{t().round.left(row.name)}</option>
								{/if}
							</select>
							<label class="pos">
								<span>P</span>
								<input
									name="result_pos"
									type="number"
									min="1"
									max="99"
									aria-label={t().round.position}
									bind:value={row.pos}
								/>
							</label>
							<button type="button" class="a-icon-btn danger" onclick={() => remove(i)} aria-label={t().round.removeResult}>
								<Icon name="trash" />
							</button>
							{#if e[`result_${i}`]}<p class="a-err">{e[`result_${i}`]}</p>{/if}
						</li>
					{/each}
				</ol>
			{:else}
				<p class="a-help none">
					{finished ? t().round.noResults : t().round.notYet}
				</p>
			{/if}

			<button type="button" class="btn btn-ghost" onclick={add} disabled={!data.pilots.length}>
				<Icon name="plus" /> {t().round.addResult}
			</button>
			{#if e.date && rows.length}<p class="a-err gap">{e.date}</p>{/if}
		</section>
	</div>

	<SaveBar cancel="/admin/season" label={data.isNew ? t().round.create : undefined} rev={data.rev} />
</form>

{#if !data.isNew}
	<form
		class="a-danger a-card"
		method="post"
		action="?/delete"
		use:enhance={confirmFirst(t().round.delConfirm(r.location))}
	>
		<div>
			<h2>{t().round.del}</h2>
			<p class="a-desc">{t().round.delDesc}</p>
		</div>
		<button class="btn btn-danger"><Icon name="trash" /> {t().round.del}</button>
	</form>
{/if}

<style>
	/* Four equal buttons, so the choice always fits on one line */
	.days {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
	.days .a-choice {
		justify-content: center;
		padding: 0 0.4rem;
		white-space: nowrap;
	}
	/* The weekend in words, under the length */
	.spelled {
		color: var(--fg-2);
	}
	.spelled::first-letter {
		text-transform: uppercase;
	}
	.results {
		display: grid;
		gap: 0.6rem;
		margin: 0 0 1.25rem;
		padding: 0;
		list-style: none;
	}
	.results li {
		display: grid;
		grid-template-columns: 1.5rem minmax(0, 1fr) 6.5rem auto;
		align-items: center;
		gap: 0.6rem;
	}
	.results .a-err {
		grid-column: 2 / -1;
	}
	.n {
		font-size: 1.2rem;
		color: var(--fg-3);
		text-align: center;
	}
	.pos {
		position: relative;
	}
	.pos span {
		position: absolute;
		top: 50%;
		left: 0.8rem;
		translate: 0 -50%;
		font-weight: 800;
		color: var(--fg-3);
		pointer-events: none;
	}
	.pos input {
		padding-left: 1.8rem;
	}
	.results li.invalid select,
	.results li.invalid input {
		border-color: var(--danger);
	}
	.none {
		margin-bottom: 1.25rem;
	}
	.gap {
		margin-top: 0.75rem;
	}
</style>
