<script lang="ts">
	import Icon from '#lib/admin/Icon.svelte';
	import { longDate, madeiraToday } from '#lib/content.ts';
	import { t, lang } from '#lib/admin/i18n.ts';

	let { data } = $props();

	const today = madeiraToday();
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">{t().common.team}</p>
		<h1 class="a-title">{t().nav.news}</h1>
		<p class="a-lede">{t().news.lede}</p>
	</div>
	<div class="a-actions">
		<a class="btn" href="/admin/news/new"><Icon name="plus" /> {t().news.add}</a>
	</div>
</header>

{#if data.posts.length}
	<ul class="a-list">
		{#each data.posts as post (post.id)}
			{@const scheduled = post.published && post.date > today}
			<li class="a-row">
				{#if post.cover}
					<img class="a-thumb" src={post.cover} alt="" />
				{:else}
					<span class="a-thumb blank"><Icon name="news" /></span>
				{/if}
				<span class="grow">
					<a class="name" href="/admin/news/{post.id}">{post.title.pt || post.title.en}</a>
					<span class="meta">{scheduled ? t().news.scheduledFor(longDate(post.date, lang())) : longDate(post.date, lang())}</span>
				</span>
				<span class="a-chip" class:ok={post.published && !scheduled} class:warn={scheduled}>
					{scheduled ? t().news.scheduled : post.published ? t().news.published : t().news.draft}
				</span>
				<span class="tools">
					<a
						class="a-icon-btn"
						href="/noticias/{post.slug}"
						target="_blank"
						rel="noreferrer"
						aria-label={post.published && !scheduled ? t().common.viewSite : t().news.preview}
						title={post.published && !scheduled ? t().common.viewSite : t().news.preview}
					>
						<Icon name={post.published && !scheduled ? 'external' : 'eye'} />
					</a>
					<a class="a-icon-btn" href="/admin/news/{post.id}" aria-label={t().common.edit(post.title.pt || post.title.en)}><Icon name="edit" /></a>
				</span>
			</li>
		{/each}
	</ul>
{:else}
	<div class="a-list a-empty">
		<p>{t().news.empty}</p>
		<a class="btn" href="/admin/news/new"><Icon name="plus" /> {t().news.addFirst}</a>
	</div>
{/if}

<style>
	.blank {
		display: grid;
		place-items: center;
		color: var(--fg-3);
	}
	.blank :global(svg) {
		width: 1.1rem;
	}
</style>
