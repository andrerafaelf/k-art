<script lang="ts">
	import { page } from '$app/state';
	import PostCard from '#lib/components/PostCard.svelte';
	import { useI18n } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	let { data } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.news);
	const title = $derived(i18n.lines('news.title'));
	const [first, ...rest] = $derived(data.posts);
</script>

<svelte:head>
	<title>{i18n.text('news.eyebrow')}, K'ART Racing Team</title>
	<meta name="description" content={i18n.text('news.intro')} />
	<meta property="og:image" content="{page.url.origin}/og.png" />
</svelte:head>

<main class="wrap">
	<header class="head" use:inview>
		<p class="eyebrow rv">{i18n.text('news.eyebrow')}</p>
		<h1 class="display">
			{#each title as line, i}
				<span class="line"><span class:accent={i === title.length - 1} style:--d="{60 + i * 90}ms">{line}</span></span>
			{/each}
		</h1>
		<p class="lead rv" style:--d="240ms">{i18n.text('news.intro')}</p>
	</header>

	{#if first}
		<div class="feature" use:inview>
			<div class="rv"><PostCard post={first} feature /></div>
		</div>
		{#if rest.length}
			<ul class="grid" use:inview>
				{#each rest as post, i (post.id)}
					<li class="rv" style:--d="{(i % 3) * 90}ms"><PostCard {post} /></li>
				{/each}
			</ul>
		{/if}
	{:else}
		<p class="empty">{i18n.text('news.empty')}</p>
	{/if}
</main>

<style>
	main {
		padding-top: var(--page-top);
		padding-bottom: var(--section);
	}
	.head {
		margin-bottom: clamp(3rem, 6vw, 5rem);
	}
	h1 {
		margin-top: 1.6rem;
		font-size: var(--t-page);
	}
	.lead {
		max-width: 32rem;
		margin-top: 1.75rem;
	}
	.feature {
		padding-bottom: clamp(3rem, 6vw, 5rem);
		margin-bottom: clamp(3rem, 6vw, 5rem);
		border-bottom: 1px solid var(--hair);
	}
	.grid {
		display: grid;
		gap: 3rem 1.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.empty {
		padding-block: 4rem;
		color: var(--fg-2);
	}

	@media (min-width: 760px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.feature :global(.card) {
			display: grid;
			grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
			gap: 2.5rem;
			align-items: end;
		}
	}
	@media (min-width: 1100px) {
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
