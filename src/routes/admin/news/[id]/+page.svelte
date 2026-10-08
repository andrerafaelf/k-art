<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import LangField from '#lib/admin/LangField.svelte';
	import ImageField from '#lib/admin/ImageField.svelte';
	import PostBody from '#lib/admin/PostBody.svelte';
	import SaveBar from '#lib/admin/SaveBar.svelte';
	import { keep, confirmFirst } from '#lib/admin/forms.ts';
	import { t } from '#lib/admin/i18n.ts';
	import { isLive } from '#lib/content.ts';

	let { data, form } = $props();

	const p = $derived(data.post);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	const live = $derived(isLive(p));
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/news"><Icon name="back" /> {t().nav.news}</a>
		<h1 class="a-title">{data.isNew ? t().post.new : t().post.edit}</h1>
	</div>
	{#if !data.isNew}
		<div class="a-actions">
			<a class="btn btn-ghost" href="/noticias/{p.slug}" target="_blank" rel="noreferrer">
				{live ? t().common.viewSite : t().news.preview} <Icon name={live ? 'external' : 'eye'} />
			</a>
		</div>
	{/if}
</header>

<form method="post" action="?/save" enctype="multipart/form-data" use:enhance={keep} novalidate>
	<div class="a-stack">
		<section class="a-card">
			<h2>{t().post.story}</h2>
			<p class="a-desc">{t().post.storyDesc}</p>
			<div class="a-fields">
				<LangField name="title" label={t().post.title} value={p.title} errors={e} maxlength={140} required wide />
				<LangField
					name="excerpt"
					label={t().post.summary}
					value={p.excerpt}
					errors={e}
					rows={2}
					maxlength={300}
					hint={t().post.summaryHint}
					wide
				/>
				<PostBody name="body" label={t().post.text} value={p.body} errors={e} hint={t().post.textHint} required />
			</div>
		</section>

		<section class="a-card">
			<h2>{t().post.cover}</h2>
			<p class="a-desc">{t().post.coverDesc}</p>
			<ImageField name="cover" label={t().post.coverLabel} current={p.cover} error={e.cover} />
		</section>

		<section class="a-card">
			<h2>{t().post.publishing}</h2>
			<div class="a-fields">
				<TextField name="date" label={t().post.date} type="date" value={p.date} error={e.date} hint={t().post.dateHint} required />
				<TextField
					name="slug"
					label={t().post.address}
					value={p.slug}
					error={e.slug}
					placeholder={t().post.addressPlaceholder}
					hint={p.slug ? t().post.addressHint(p.slug) : t().post.addressEmpty}
					optional
				/>
				<div class="a-field wide">
					<label class="a-switch">
						<input type="checkbox" name="published" checked={p.published} />
						{t().post.publishedLabel}
					</label>
					<p class="a-hint">{t().post.draftHint}</p>
				</div>
			</div>
		</section>
	</div>

	<SaveBar cancel="/admin/news" label={data.isNew ? t().post.create : undefined} rev={data.rev} />
</form>

{#if !data.isNew}
	<form class="a-danger a-card" method="post" action="?/delete" use:enhance={confirmFirst(t().post.delConfirm)}>
		<div>
			<h2>{t().post.del}</h2>
			<p class="a-desc">{t().post.delDesc}</p>
		</div>
		<button class="btn btn-danger"><Icon name="trash" /> {t().post.del}</button>
	</form>
{/if}
