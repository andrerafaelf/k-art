<script lang="ts">
	import { page } from '$app/state';
	import PostCard from '#lib/components/PostCard.svelte';
	import Arrow from '#lib/components/Arrow.svelte';
	import { tr, longDate } from '#lib/content.ts';
	import { useI18n, newsPath } from '#lib/i18n.ts';
	import { render } from '#lib/markdown.ts';
	import '#lib/prose.css';

	let { data } = $props();

	const i18n = useI18n();
	const title = $derived(tr(data.post.title, i18n.lang));
	const excerpt = $derived(tr(data.post.excerpt, i18n.lang));
	const html = $derived(render(tr(data.post.body, i18n.lang)));
</script>

<svelte:head>
	<title>{title}, K'ART Racing Team</title>
	<meta name="description" content={excerpt} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={excerpt} />
	<meta property="og:type" content="article" />
	<meta property="og:image" content="{page.url.origin}{data.post.cover ?? '/og.png'}" />
	{#if data.preview}<meta name="robots" content="noindex, nofollow" />{/if}
</svelte:head>

<main>
	<article>
		<header class="wrap head">
			<a class="back" href={newsPath(i18n.lang)}><Arrow dir="left" /> {i18n.t.news.all}</a>
			<time datetime={data.post.date}>{longDate(data.post.date, i18n.lang)}</time>
			<h1>{title}</h1>
			{#if excerpt}
				<p class="lead">{excerpt}</p>
			{/if}
		</header>

		{#if data.post.cover}
			<figure class="wrap cover">
				<img src={data.post.cover} alt="" />
			</figure>
		{/if}

		<div class="wrap">
			<div class="prose">
				<!-- render() escapes everything before adding its few tags -->
				{@html html}
			</div>
		</div>
	</article>

	{#if data.others.length}
		<aside class="wrap more">
			<p class="eyebrow">{i18n.t.news.eyebrow}</p>
			<ul>
				{#each data.others as post (post.id)}
					<li><PostCard {post} /></li>
				{/each}
			</ul>
		</aside>
	{/if}
</main>

<!-- Only for people signed in to the admin -->
{#if data.edit}
	<aside class="adminbar" class:preview={data.preview}>
		{#if data.preview}
			<p>
				<span class="dot" aria-hidden="true"></span>
				{data.preview.scheduled ? i18n.t.news.scheduled(longDate(data.post.date, i18n.lang)) : i18n.t.news.draft}
			</p>
		{/if}
		<a href={data.edit}>{i18n.t.news.edit} <Arrow /></a>
	</aside>
{/if}

<style>
	main {
		padding-top: calc(var(--nav-h) + clamp(2.5rem, 6vw, 5rem));
		padding-bottom: var(--section);
	}
	.head {
		max-width: 62rem;
	}
	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: clamp(2rem, 5vw, 3.5rem);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--fg-2);
		transition: color 0.3s;
	}
	.back:hover {
		color: var(--fg);
	}
	.back :global(svg) {
		width: 0.9rem;
		color: var(--lime);
	}
	time {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	h1 {
		margin-top: 1.25rem;
		font-size: var(--t-page);
		font-weight: 800;
		font-stretch: 115%;
		letter-spacing: -0.035em;
		line-height: 1;
		text-wrap: balance;
	}
	.lead {
		max-width: 40rem;
		margin-top: 1.75rem;
	}
	.cover {
		margin-top: clamp(2.5rem, 5vw, 4rem);
	}
	.cover img {
		width: 100%;
		max-height: 80vh;
		object-fit: cover;
	}

	.prose {
		max-width: 42rem;
		margin: clamp(2.5rem, 5vw, 4rem) auto 0;
	}

	.adminbar {
		position: fixed;
		right: 1rem;
		bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
		z-index: 150;
		display: flex;
		align-items: center;
		gap: 0.75rem 1.25rem;
		max-width: calc(100vw - 2rem);
		padding: 0.5rem 0.5rem 0.5rem 1rem;
		border: 1px solid var(--hair-2);
		border-radius: 8px;
		background: rgb(18 20 24 / 0.94);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		box-shadow: 0 18px 50px rgb(0 0 0 / 0.5);
		font-size: 0.85rem;
	}
	.adminbar:not(.preview) {
		padding-left: 0.5rem;
	}
	.adminbar.preview {
		left: 1rem;
		margin-inline: auto;
		width: fit-content;
		flex-wrap: wrap;
	}
	.adminbar p {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		line-height: 1.45;
		color: var(--fg-2);
	}
	.dot {
		flex-shrink: 0;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--plate);
		translate: 0 -0.05rem;
	}
	.adminbar a {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		flex-shrink: 0;
		margin-left: auto;
		padding: 0.55rem 0.85rem;
		border-radius: 6px;
		background: var(--lime);
		color: var(--black);
		font-weight: 700;
	}
	.adminbar a :global(svg) {
		width: 0.8rem;
	}

	.more {
		margin-top: var(--section);
		padding-top: 2rem;
		border-top: 1px solid var(--hair);
	}
	.more ul {
		display: grid;
		gap: 3rem 1.5rem;
		margin: 1.75rem 0 0;
		padding: 0;
		list-style: none;
	}
	@media (min-width: 760px) {
		.more ul {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
