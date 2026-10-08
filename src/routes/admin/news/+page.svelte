<script lang="ts">
	import Icon from '#lib/admin/Icon.svelte';
	import { longDate } from '#lib/content.ts';

	let { data } = $props();
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">K'ART Racing Team</p>
		<h1 class="a-title">News</h1>
		<p class="a-lede">
			Race reports and team news. The three latest published posts appear on the homepage, and all of
			them at /noticias and /en/news.
		</p>
	</div>
	<div class="a-actions">
		<a class="btn" href="/admin/news/new"><Icon name="plus" /> New post</a>
	</div>
</header>

{#if data.posts.length}
	<ul class="a-list">
		{#each data.posts as post (post.id)}
			<li class="a-row">
				{#if post.cover}
					<img class="a-thumb" src={post.cover} alt="" />
				{:else}
					<span class="a-thumb blank"><Icon name="news" /></span>
				{/if}
				<span class="grow">
					<a class="name" href="/admin/news/{post.id}">{post.title.pt || post.title.en}</a>
					<span class="meta">{longDate(post.date, 'en')}</span>
				</span>
				<span class="a-chip" class:ok={post.published}>{post.published ? 'Published' : 'Draft'}</span>
				<span class="tools">
					{#if post.published}
						<a class="a-icon-btn" href="/noticias/{post.slug}" target="_blank" rel="noreferrer" aria-label="View on the site">
							<Icon name="external" />
						</a>
					{/if}
					<a class="a-icon-btn" href="/admin/news/{post.id}" aria-label="Edit"><Icon name="edit" /></a>
				</span>
			</li>
		{/each}
	</ul>
{:else}
	<div class="a-list a-empty">
		<p>No posts yet. The news section appears on the site once the first one is published.</p>
		<a class="btn" href="/admin/news/new"><Icon name="plus" /> Write the first post</a>
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
