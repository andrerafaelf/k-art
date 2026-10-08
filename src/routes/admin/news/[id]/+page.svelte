<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import LangField from '#lib/admin/LangField.svelte';
	import ImageField from '#lib/admin/ImageField.svelte';
	import { keep, confirmFirst } from '#lib/admin/forms.ts';

	let { data, form } = $props();

	const p = $derived(data.post);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/news"><Icon name="back" /> News</a>
		<h1 class="a-title">{data.isNew ? 'New post' : 'Edit post'}</h1>
	</div>
	{#if !data.isNew && p.published}
		<div class="a-actions">
			<a class="btn btn-ghost" href="/noticias/{p.slug}" target="_blank" rel="noreferrer">
				View on the site <Icon name="external" />
			</a>
		</div>
	{/if}
</header>

<form method="post" action="?/save" enctype="multipart/form-data" use:enhance={keep} novalidate>
	<div class="a-stack">
		<section class="a-card">
			<h2>Story</h2>
			<p class="a-desc">Write the Portuguese version first. English is optional; without it the English site shows the Portuguese.</p>
			<div class="a-fields">
				<LangField name="title" label="Title" value={p.title} errors={e} maxlength={140} required wide />
				<LangField
					name="excerpt"
					label="Summary"
					value={p.excerpt}
					errors={e}
					rows={2}
					maxlength={300}
					hint="One or two sentences, shown on the news cards and in search results."
					wide
				/>
				<LangField name="body" label="Text" value={p.body} errors={e} rows={14} required wide />
			</div>
			<p class="a-help format">
				Formatting: a blank line starts a new paragraph. <code>## Heading</code>, <code>- list item</code>,
				<code>&gt; quote</code>, <code>**bold**</code>, <code>_italic_</code> and
				<code>[link text](https://...)</code>.
			</p>
		</section>

		<section class="a-card">
			<h2>Cover</h2>
			<p class="a-desc">A landscape photo works best. Without one, the post gets a cover in the team colours.</p>
			<ImageField name="cover" label="Cover image" current={p.cover} error={e.cover} />
		</section>

		<section class="a-card">
			<h2>Publishing</h2>
			<div class="a-fields">
				<TextField name="date" label="Date" type="date" value={p.date} error={e.date} required />
				<TextField
					name="slug"
					label="Address"
					value={p.slug}
					error={e.slug}
					placeholder="Made from the title"
					hint={p.slug ? `/noticias/${p.slug} and /en/news/${p.slug}` : 'Leave empty to make it from the Portuguese title'}
					optional
				/>
				<div class="a-field wide">
					<label class="a-switch">
						<input type="checkbox" name="published" checked={p.published} />
						Published on the site
					</label>
					<p class="a-hint">Drafts are only visible here.</p>
				</div>
			</div>
		</section>
	</div>

	<div class="a-savebar">
		<span class="a-help">Changes go live on the site as soon as you save.</span>
		<div class="a-actions">
			<a class="btn btn-ghost" href="/admin/news">Cancel</a>
			<button class="btn">{data.isNew ? 'Create post' : 'Save changes'}</button>
		</div>
	</div>
</form>

{#if !data.isNew}
	<form class="a-danger a-card" method="post" action="?/delete" use:enhance={confirmFirst('Delete this post for good?')}>
		<div>
			<h2>Delete post</h2>
			<p class="a-desc">Removes it from the site. To hide it for now, switch off Published instead.</p>
		</div>
		<button class="btn btn-danger"><Icon name="trash" /> Delete post</button>
	</form>
{/if}

<style>
	.format {
		margin-top: 1rem;
		line-height: 1.9;
	}
</style>
