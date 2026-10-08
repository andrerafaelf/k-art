<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import LangField from '#lib/admin/LangField.svelte';
	import ImageField from '#lib/admin/ImageField.svelte';
	import { keep, confirmFirst } from '#lib/admin/forms.ts';

	let { data, form } = $props();

	const a = $derived(data.a);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	let accent = $derived(a.accent);
	let number = $derived(a.number || '');
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/hall"><Icon name="back" /> Hall of Fame</a>
		<h1 class="a-title">{data.isNew ? 'Former driver' : `${a.first} ${a.last}`}</h1>
	</div>
	<span class="a-plate big {accent}" aria-hidden="true">{number || '?'}</span>
</header>

<form method="post" action="?/save" enctype="multipart/form-data" use:enhance={keep} novalidate>
	<div class="a-stack">
		<section class="a-card">
			<h2>Driver</h2>
			<div class="a-fields">
				<TextField name="first" label="First name" value={a.first} error={e.first} required />
				<TextField name="last" label="Surname" value={a.last} error={e.last} required />
				<TextField
					name="number"
					label="Race number"
					type="number"
					min="0"
					value={a.number || ''}
					error={e.number}
					oninput={(ev) => (number = Number(ev.currentTarget.value) || '')}
				/>
				<TextField name="categories" label="Classes raced" value={a.categories} error={e.categories} hint="For example Júnior X30, Sénior X30" required />
				<div class="a-field wide">
					<span class="a-label">Card colour</span>
					<div class="a-choices">
						<label class="a-choice">
							<input type="radio" name="accent" value="lime" checked={a.accent === 'lime'} onchange={() => (accent = 'lime')} />
							<span class="a-swatch" style:background="var(--lime)"></span> Lime
						</label>
						<label class="a-choice">
							<input type="radio" name="accent" value="cyan" checked={a.accent === 'cyan'} onchange={() => (accent = 'cyan')} />
							<span class="a-swatch" style:background="var(--cyan)"></span> Cyan
						</label>
					</div>
				</div>
			</div>
		</section>

		<section class="a-card">
			<h2>With the team</h2>
			<p class="a-desc">Seasons and results with K'ART only.</p>
			<div class="a-fields nums">
				<TextField name="from" label="First season" type="number" value={a.from} error={e.from} required />
				<TextField name="to" label="Last season" type="number" value={a.to} error={e.to} required />
				<TextField name="starts" label="Starts" type="number" min="0" value={a.record.starts} error={e.starts} />
				<TextField name="wins" label="Wins" type="number" min="0" value={a.record.wins} error={e.wins} />
				<TextField name="podiums" label="Podiums" type="number" min="0" value={a.record.podiums} error={e.podiums} />
				<TextField name="poles" label="Pole positions" type="number" min="0" value={a.record.poles} error={e.poles} />
			</div>
		</section>

		<section class="a-card">
			<h2>Legacy</h2>
			<div class="a-fields">
				<LangField
					name="titles"
					label="Titles and highlights"
					value={a.titles}
					errors={e}
					rows={3}
					hint="One per line."
					wide
				/>
				<LangField
					name="now"
					label="Where they race now"
					value={a.now}
					errors={e}
					placeholder="Fórmula 4 Espanhola"
					wide
				/>
			</div>
		</section>

		<section class="a-card">
			<h2>Photo</h2>
			<ImageField name="photo" label="Portrait" current={a.photo} error={e.photo} />
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
	<form class="a-danger a-card" method="post" action="?/delete" use:enhance={confirmFirst(`Remove ${a.first} ${a.last} from the Hall of Fame?`)}>
		<div>
			<h2>Remove</h2>
			<p class="a-desc">Takes them off the site.</p>
		</div>
		<button class="btn btn-danger"><Icon name="trash" /> Remove {a.first}</button>
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
