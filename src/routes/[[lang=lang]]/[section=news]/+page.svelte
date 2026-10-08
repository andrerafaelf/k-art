<script lang="ts">
	import { page } from '$app/state';
	import Nav from '#lib/components/Nav.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import PostCard from '#lib/components/PostCard.svelte';
	import { useI18n, siteLinks, alternatePath } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	let { data } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.news);
	const links = $derived(siteLinks(i18n.t, i18n.lang, { home: false, news: true }));
	const [first, ...rest] = $derived(data.posts);
</script>

<svelte:head>
	<title>{t.eyebrow}, K'ART Racing Team</title>
	<meta name="description" content={t.intro} />
	<meta property="og:image" content="{page.url.origin}/og.png" />
</svelte:head>

<Nav settings={data.settings} {links} altHref={alternatePath(page.url.pathname, i18n.t.lang.other)} />

<main class="wrap">
	<header class="head" use:inview>
		<p class="eyebrow rv">{t.eyebrow}</p>
		<h1 class="display">
			{#each t.title as line, i}
				<span class="line"><span class:accent={i === 1} style:--d="{60 + i * 90}ms">{line}</span></span>
			{/each}
		</h1>
		<p class="lead rv" style:--d="240ms">{t.intro}</p>
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
		<p class="empty">{t.empty}</p>
	{/if}
</main>

<Footer settings={data.settings} links={links.filter((l) => l.id !== 'contact')} />

<style>
	main {
		padding-top: calc(var(--nav-h) + clamp(3rem, 8vw, 7rem));
		padding-bottom: var(--section);
	}
	.head {
		margin-bottom: clamp(3rem, 6vw, 5rem);
	}
	h1 {
		margin-top: 1.6rem;
		font-size: clamp(3rem, 8vw, 7.5rem);
	}
	.accent {
		color: var(--lime);
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
