<script lang="ts">
	import { page } from '$app/state';
	import Nav from '#lib/components/Nav.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import PostCard from '#lib/components/PostCard.svelte';
	import Arrow from '#lib/components/Arrow.svelte';
	import { tr, longDate } from '#lib/content.ts';
	import { useI18n, siteLinks, alternatePath, newsPath } from '#lib/i18n.ts';
	import { render } from '#lib/markdown.ts';

	let { data } = $props();

	const i18n = useI18n();
	const links = $derived(siteLinks(i18n.t, i18n.lang, { home: false, news: true }));
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
</svelte:head>

<Nav settings={data.settings} {links} altHref={alternatePath(page.url.pathname, i18n.t.lang.other)} />

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

<Footer settings={data.settings} links={links.filter((l) => l.id !== 'contact')} />

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
		font-size: clamp(2.25rem, 5.4vw, 4.75rem);
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
		font-size: 1.125rem;
		line-height: 1.7;
		color: rgb(243 243 239 / 0.82);
	}
	.prose :global(p + p),
	.prose :global(ul),
	.prose :global(blockquote) {
		margin-top: 1.4em;
	}
	.prose :global(h2),
	.prose :global(h3) {
		margin-top: 2.2em;
		color: var(--fg);
		font-weight: 800;
		font-stretch: 115%;
		letter-spacing: -0.02em;
		line-height: 1.15;
	}
	.prose :global(h2) {
		font-size: 1.75rem;
	}
	.prose :global(h3) {
		font-size: 1.3rem;
	}
	.prose :global(h2 + p),
	.prose :global(h3 + p) {
		margin-top: 0.8em;
	}
	.prose :global(strong) {
		color: var(--fg);
	}
	.prose :global(a) {
		color: var(--fg);
		text-decoration: underline;
		text-decoration-color: var(--lime);
		text-underline-offset: 0.2em;
	}
	.prose :global(ul) {
		padding-left: 1.2em;
	}
	.prose :global(li::marker) {
		color: var(--lime);
	}
	.prose :global(blockquote) {
		margin-inline: 0;
		padding-left: 1.25rem;
		border-left: 3px solid var(--lime);
		font-size: 1.4rem;
		font-weight: 600;
		line-height: 1.35;
		color: var(--fg);
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
