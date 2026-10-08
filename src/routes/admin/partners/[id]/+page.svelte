<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import ImageField from '#lib/admin/ImageField.svelte';
	import { keep, confirmFirst } from '#lib/admin/forms.ts';

	let { data, form } = $props();

	const p = $derived(data.partner);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	let tone = $derived(p.tone);
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/partners"><Icon name="back" /> Partners</a>
		<h1 class="a-title">{data.isNew ? 'New partner' : p.name}</h1>
	</div>
</header>

<form method="post" action="?/save" enctype="multipart/form-data" use:enhance={keep} novalidate>
	<section class="a-card">
		<div class="a-fields">
			<TextField name="name" label="Name" value={p.name} error={e.name} maxlength={60} required />
			<TextField
				name="url"
				label="Website"
				value={p.url ?? ''}
				error={e.url}
				placeholder="https://"
				hint="The logo links here"
				optional
			/>
			<div class="a-field wide">
				<span class="a-label">Tile colour</span>
				<div class="a-choices">
					<label class="a-choice">
						<input type="radio" name="tone" value="dark" checked={p.tone === 'dark'} onchange={() => (tone = 'dark')} />
						<span class="a-swatch" style:background="#0e0f11" style:box-shadow="inset 0 0 0 1px var(--hair-2)"></span>
						Dark, for light logos
					</label>
					<label class="a-choice">
						<input type="radio" name="tone" value="light" checked={p.tone === 'light'} onchange={() => (tone = 'light')} />
						<span class="a-swatch" style:background="#efeee9"></span>
						Light, for dark logos
					</label>
				</div>
			</div>
			<ImageField
				name="logo"
				label="Logo"
				current={p.logo || undefined}
				error={e.logo}
				removable={false}
				svg
				{tone}
				hint="SVG is best. Otherwise a PNG with a transparent background."
				wide
			/>
		</div>
	</section>

	<div class="a-savebar">
		<span class="a-help">Changes go live on the site as soon as you save.</span>
		<div class="a-actions">
			<a class="btn btn-ghost" href="/admin/partners">Cancel</a>
			<button class="btn">{data.isNew ? 'Add partner' : 'Save changes'}</button>
		</div>
	</div>
</form>

{#if !data.isNew}
	<form class="a-danger a-card" method="post" action="?/delete" use:enhance={confirmFirst(`Remove ${p.name}?`)}>
		<div>
			<h2>Remove partner</h2>
			<p class="a-desc">Takes their logo off the site.</p>
		</div>
		<button class="btn btn-danger"><Icon name="trash" /> Remove</button>
	</form>
{/if}
