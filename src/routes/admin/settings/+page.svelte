<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import LangField from '#lib/admin/LangField.svelte';
	import { keep, confirmFirst } from '#lib/admin/forms.ts';

	let { data, form } = $props();

	const s = $derived(data.settings);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);

	const ZONE_NAMES = { pods: 'Sidepods', nassau: 'Nassau panel', nose: 'Front fairing', bumper: 'Rear bumper' };
	const stamp = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">K'ART Racing Team</p>
		<h1 class="a-title">Site settings</h1>
		<p class="a-lede">Contact details and the main texts on the homepage.</p>
	</div>
</header>

<form method="post" action="?/save" use:enhance={keep} novalidate>
	<div class="a-stack">
		<section class="a-card">
			<h2>Contact</h2>
			<p class="a-desc">Used in the contact section, the footer and the partner deck button.</p>
			<div class="a-fields">
				<TextField name="email" label="Email" type="email" value={s.email} error={e.email} required />
				<TextField
					name="instagram"
					label="Instagram"
					value={s.instagram}
					error={e.instagram}
					hint="The handle, without the @"
					required
				/>
				<TextField
					name="location"
					label="Base"
					value={s.location}
					error={e.location}
					hint="Shown in the footer"
					required
				/>
			</div>
		</section>

		<section class="a-card">
			<h2>Hero</h2>
			<p class="a-desc">The first thing visitors see.</p>
			<div class="a-fields">
				<LangField name="heroEyebrow" label="Small line above the title" value={s.heroEyebrow} errors={e} required wide />
				<LangField
					name="heroLines"
					label="Title"
					value={s.heroLines}
					errors={e}
					rows={4}
					hint="One line per row, up to 16 characters each. The last line is highlighted in lime."
					required
					wide
				/>
				<LangField name="heroLead" label="Introduction" value={s.heroLead} errors={e} rows={3} required wide />
			</div>
		</section>

		<section class="a-card">
			<h2>Season</h2>
			<div class="a-fields">
				<TextField
					name="seasonYear"
					label="Season year"
					type="number"
					value={s.seasonYear}
					error={e.seasonYear}
					hint="Used in headings like “Temporada 2026”"
					required
				/>
				<LangField
					name="seasonIntro"
					label="Calendar introduction"
					value={s.seasonIntro}
					errors={e}
					rows={2}
					hint="The wins and podiums so far are added after this automatically."
					required
					wide
				/>
			</div>
		</section>

		<section class="a-card" id="packages">
			<h2>Sponsorship</h2>
			<p class="a-desc">
				The pitch in the partners section and the four positions on the kart. The number of karts is
				added automatically from the line-up.
			</p>
			<div class="a-fields">
				<LangField name="partnersIntro" label="Introduction" value={s.partnersIntro} errors={e} rows={2} required wide />
			</div>
			{#each s.packages as p, i (p.zone)}
				<fieldset class="pkg">
					<legend><span class="num">0{i + 1}</span> {ZONE_NAMES[p.zone]}</legend>
					<div class="a-fields">
						<LangField name="{p.zone}.title" label="Name" value={p.title} errors={e} required />
						<LangField name="{p.zone}.tier" label="Tier" value={p.tier} errors={e} required />
						<LangField name="{p.zone}.body" label="Description" value={p.body} errors={e} rows={2} required wide />
					</div>
				</fieldset>
			{/each}
		</section>

		<section class="a-card">
			<h2>Contact texts</h2>
			<div class="a-fields">
				<LangField name="tryouts" label="For drivers" value={s.tryouts} errors={e} rows={3} required wide />
				<LangField name="press" label="For partners and press" value={s.press} errors={e} rows={2} required wide />
			</div>
		</section>
	</div>

	<div class="a-savebar">
		<span class="a-help">Changes go live on the site as soon as you save.</span>
		<div class="a-actions">
			<button class="btn">Save settings</button>
		</div>
	</div>
</form>

<section class="a-card history">
	<h2><Icon name="history" /> Version history</h2>
	<p class="a-desc">
		A copy of the whole site is kept before every save, the last 40 of them. Restoring one puts
		everything back as it was then, and the current version is kept, so a restore can be undone too.
	</p>
	{#if data.backups.length}
		<ul>
			{#each data.backups as b}
				<li>
					<span>{stamp.format(new Date(b.saved))}</span>
					<form
						method="post"
						action="?/restore"
						use:enhance={confirmFirst('Put the whole site back to this version?')}
					>
						<input type="hidden" name="backup" value={b.name} />
						<button class="btn btn-ghost">Restore</button>
					</form>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="a-help">No earlier versions yet. They appear here after the first save.</p>
	{/if}
</section>

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
		margin-top: 3rem;
	}
	.history h2 {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.history h2 :global(svg) {
		width: 1.1rem;
		color: var(--lime);
	}
	.history ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.history li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.6rem 0;
		border-top: 1px solid var(--hair);
		font-variant-numeric: tabular-nums;
	}
	.history .btn {
		height: 2.2rem;
		font-size: 0.8rem;
	}
</style>
