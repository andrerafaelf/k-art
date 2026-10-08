<script lang="ts">
	import { page } from '$app/state';
	import Nav from '#lib/components/Nav.svelte';
	import Hero from '#lib/components/Hero.svelte';
	import Kerb from '#lib/components/Kerb.svelte';
	import Team from '#lib/components/Team.svelte';
	import HallTeaser from '#lib/components/HallTeaser.svelte';
	import Pilots from '#lib/components/Pilots.svelte';
	import Season from '#lib/components/Season.svelte';
	import News from '#lib/components/News.svelte';
	import Island from '#lib/components/Island.svelte';
	import Partners from '#lib/components/Partners.svelte';
	import Contact from '#lib/components/Contact.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import { useI18n, siteLinks, alternatePath } from '#lib/i18n.ts';

	let { data } = $props();

	const i18n = useI18n();
	const links = $derived(siteLinks(i18n.t, i18n.lang, { home: true, news: data.latest.length > 0 }));
</script>

<svelte:head>
	<title>{i18n.t.meta.title}</title>
	<meta name="description" content={i18n.t.meta.description} />
	<meta property="og:title" content="K'ART Racing Team" />
	<meta property="og:description" content={i18n.t.meta.description} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="{page.url.origin}/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
</svelte:head>

<Nav settings={data.settings} {links} altHref={alternatePath(page.url.pathname, i18n.t.lang.other)} />

<main>
	<Hero pilots={data.pilots} season={data.season} settings={data.settings} />
	<Kerb />
	<Team pilots={data.pilots} season={data.season} year={data.settings.seasonYear} />
	{#if data.pilots.length}
		<Pilots pilots={data.pilots} year={data.settings.seasonYear} />
	{/if}
	{#if data.season.length}
		<Season season={data.season} settings={data.settings} />
	{/if}
	<HallTeaser history={data.history} alumni={data.alumni} index="S4" />
	{#if data.latest.length}
		<News posts={data.latest} />
	{/if}
	<Island />
	<Partners settings={data.settings} partners={data.partners} karts={data.pilots.length} />
	<Contact settings={data.settings} />
	<Footer settings={data.settings} links={links.filter((l) => l.id !== 'contact')} />
</main>
