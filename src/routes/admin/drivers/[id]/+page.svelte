<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import LangField from '#lib/admin/LangField.svelte';
	import ImageField from '#lib/admin/ImageField.svelte';
	import { keep, confirmFirst } from '#lib/admin/forms.ts';

	let { data, form } = $props();

	const p = $derived(data.pilot);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	const name = $derived(data.isNew ? 'New driver' : `${p.first} ${p.last}`);

	// Live preview of the race plate
	let number = $derived(p.number || '');
	let accent = $derived(p.accent);
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/drivers"><Icon name="back" /> Drivers</a>
		<h1 class="a-title">{name}</h1>
	</div>
	<span class="a-plate big {accent}" aria-hidden="true">{number || '?'}</span>
</header>

<form method="post" action="?/save" enctype="multipart/form-data" use:enhance={keep} novalidate>
	<div class="a-stack">
		<section class="a-card">
			<h2>Driver</h2>
			<p class="a-desc">Name, race number and class, as shown on the driver card.</p>
			<div class="a-fields">
				<TextField name="first" label="First name" value={p.first} error={e.first} maxlength={40} required />
				<TextField name="last" label="Surname" value={p.last} error={e.last} maxlength={40} required />
				<TextField
					name="number"
					label="Race number"
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
					label="Class"
					value={p.category}
					error={e.category}
					list="categories"
					hint="For example Cadete, Júnior X30 or KZ2"
					required
				/>
				<datalist id="categories">
					{#each data.categories as c}<option value={c}></option>{/each}
				</datalist>
				<div class="a-field wide">
					<span class="a-label">Card colour</span>
					<div class="a-choices">
						<label class="a-choice">
							<input type="radio" name="accent" value="lime" checked={p.accent === 'lime'} onchange={() => (accent = 'lime')} />
							<span class="a-swatch" style:background="var(--lime)"></span> Lime
						</label>
						<label class="a-choice">
							<input type="radio" name="accent" value="cyan" checked={p.accent === 'cyan'} onchange={() => (accent = 'cyan')} />
							<span class="a-swatch" style:background="var(--cyan)"></span> Cyan
						</label>
					</div>
				</div>
			</div>
		</section>

		<section class="a-card">
			<h2>Profile</h2>
			<div class="a-fields">
				<TextField name="age" label="Age" type="number" min="4" max="99" value={p.age || ''} error={e.age} required />
				<TextField name="hometown" label="Hometown" value={p.hometown} error={e.hometown} optional />
				<TextField name="since" label="Racing since" type="number" min="1950" value={p.since} error={e.since} required />
				<TextField name="chassis" label="Chassis" value={p.chassis} error={e.chassis} optional />
				<TextField name="engine" label="Engine" value={p.engine} error={e.engine} optional />
			</div>
		</section>

		<section class="a-card">
			<h2>Career record</h2>
			<p class="a-desc">
				Totals for the driver's whole career, including results from before joining the team. These
				are added together for the team stats on the homepage. Season results are entered separately,
				in the calendar.
			</p>
			<div class="a-fields record">
				<TextField name="starts" label="Starts" type="number" min="0" value={p.record.starts} error={e.starts} />
				<TextField name="wins" label="Wins" type="number" min="0" value={p.record.wins} error={e.wins} />
				<TextField name="podiums" label="Podiums" type="number" min="0" value={p.record.podiums} error={e.podiums} />
				<TextField name="poles" label="Pole positions" type="number" min="0" value={p.record.poles} error={e.poles} />
			</div>
		</section>

		<section class="a-card">
			<h2>Words</h2>
			<p class="a-desc">Shown in the driver's profile. Write the Portuguese first; English is optional.</p>
			<div class="a-fields">
				<LangField
					name="best"
					label="Best result"
					value={p.best}
					errors={e}
					maxlength={120}
					placeholder="P2, Campeonato de Portugal 2025"
					wide
				/>
				<LangField name="quote" label="Quote" value={p.quote} errors={e} maxlength={200} rows={2} wide />
			</div>
		</section>

		<section class="a-card">
			<h2>Photo</h2>
			<p class="a-desc">
				A portrait, ideally upright and at least 1200 pixels tall. It replaces the big number on the
				driver card.
			</p>
			<ImageField name="photo" label="Portrait" current={p.photo} error={e.photo} />
		</section>
	</div>

	<div class="a-savebar">
		<span class="a-help">Changes go live on the site as soon as you save.</span>
		<div class="a-actions">
			<a class="btn btn-ghost" href="/admin/drivers">Cancel</a>
			<button class="btn">{data.isNew ? 'Add driver' : 'Save changes'}</button>
		</div>
	</div>
</form>

{#if !data.isNew}
	<form
		class="retire a-card"
		method="post"
		action="?/retire"
		use:enhance={confirmFirst(`Move ${p.first} ${p.last} to the Hall of Fame? They leave the line-up and get a page among the former drivers.`)}
	>
		<div>
			<h2>Move to the Hall of Fame</h2>
			<p class="a-desc">For drivers leaving the team. Their number, photo and record go with them, and you can edit the details after.</p>
		</div>
		<button class="btn btn-ghost"><Icon name="trophy" /> Move {p.first}</button>
	</form>

	<form
		class="a-danger a-card tight"
		method="post"
		action="?/delete"
		use:enhance={confirmFirst(`Remove ${p.first} ${p.last} from the team? Their past results stay in the calendar.`)}
	>
		<div>
			<h2>Remove driver</h2>
			<p class="a-desc">Takes them off the site. Results they scored stay in the calendar under their name.</p>
		</div>
		<button class="btn btn-danger"><Icon name="trash" /> Remove {p.first}</button>
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
