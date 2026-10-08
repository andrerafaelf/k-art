<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import LangField from '#lib/admin/LangField.svelte';
	import { keep, confirmFirst } from '#lib/admin/forms.ts';
	import { roundEnd } from '#lib/content.ts';

	let { data, form } = $props();

	const r = $derived(data.round);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	const title = $derived(data.isNew ? 'New round' : `Round ${'round' in r ? r.round : ''}, ${r.location}`);

	// Editable list of results, reset from the saved round after every load
	const fromSaved = () => data.round.results.map((x) => ({ pilotId: x.pilotId, pos: String(x.pos), name: x.name }));
	let rows = $state(fromSaved());
	$effect(() => {
		rows = fromSaved();
	});
	const finished = $derived(!!r.date && roundEnd(r) <= Date.now());

	const add = () => (rows = [...rows, { pilotId: '', pos: '', name: '' }]);
	const remove = (i: number) => (rows = rows.filter((_, j) => j !== i));
	// Drivers who have left the team still show by name on their old results
	const known = (id: string) => data.pilots.some((p) => p.id === id);
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/season"><Icon name="back" /> Calendar & results</a>
		<h1 class="a-title">{title}</h1>
	</div>
</header>

<form method="post" action="?/save" use:enhance={keep} novalidate>
	<div class="a-stack">
		<section class="a-card">
			<h2>Race weekend</h2>
			<p class="a-desc">The location is shown large on the calendar, with the circuit underneath.</p>
			<div class="a-fields">
				<TextField
					name="date"
					label="First day of the weekend"
					type="date"
					value={r.date}
					error={e.date}
					required
				/>
				<TextField
					name="location"
					label="Location"
					value={r.location}
					error={e.location}
					list="locations"
					hint="Town or region, for example Braga or Madeira"
					required
				/>
				<datalist id="locations">
					{#each data.locations as l}<option value={l}></option>{/each}
				</datalist>
				<LangField name="venue" label="Circuit" value={r.venue} errors={e} required wide />
				<LangField
					name="series"
					label="Championship"
					value={r.series}
					errors={e}
					hint="For example CPK, or Regional, prova final"
					required
					wide
				/>
			</div>
		</section>

		<section class="a-card">
			<h2>Results</h2>
			<p class="a-desc">
				Every team driver's finishing position. The calendar shows the best one, and the wins and
				podiums on the site are counted from all of them.
			</p>

			{#if rows.length}
				<ol class="results">
					{#each rows as row, i}
						<li class:invalid={e[`result_${i}`]}>
							<span class="n num">{i + 1}</span>
							<select name="result_pilot" aria-label="Driver" bind:value={row.pilotId}>
								<option value="">Choose a driver</option>
								{#each data.pilots as p}
									<option value={p.id}>{p.name}, {p.category}</option>
								{/each}
								{#if row.pilotId && !known(row.pilotId)}
									<option value={row.pilotId}>{row.name} (no longer in the team)</option>
								{/if}
							</select>
							<label class="pos">
								<span>P</span>
								<input
									name="result_pos"
									type="number"
									min="1"
									max="99"
									aria-label="Finishing position"
									bind:value={row.pos}
								/>
							</label>
							<button type="button" class="a-icon-btn danger" onclick={() => remove(i)} aria-label="Remove this result">
								<Icon name="trash" />
							</button>
							{#if e[`result_${i}`]}<p class="a-err">{e[`result_${i}`]}</p>{/if}
						</li>
					{/each}
				</ol>
			{:else}
				<p class="a-help none">
					{finished ? 'No results yet for this round.' : 'Results can be added once the race weekend has happened.'}
				</p>
			{/if}

			<button type="button" class="btn btn-ghost" onclick={add} disabled={!data.pilots.length}>
				<Icon name="plus" /> Add a result
			</button>
			{#if e.date && rows.length}<p class="a-err gap">{e.date}</p>{/if}
		</section>
	</div>

	<div class="a-savebar">
		<span class="a-help">Changes go live on the site as soon as you save.</span>
		<div class="a-actions">
			<a class="btn btn-ghost" href="/admin/season">Cancel</a>
			<button class="btn">{data.isNew ? 'Add round' : 'Save changes'}</button>
		</div>
	</div>
</form>

{#if !data.isNew}
	<form
		class="a-danger a-card"
		method="post"
		action="?/delete"
		use:enhance={confirmFirst(`Delete the ${r.location} round and its results?`)}
	>
		<div>
			<h2>Delete round</h2>
			<p class="a-desc">Removes it from the calendar, along with its results.</p>
		</div>
		<button class="btn btn-danger"><Icon name="trash" /> Delete round</button>
	</form>
{/if}

<style>
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
