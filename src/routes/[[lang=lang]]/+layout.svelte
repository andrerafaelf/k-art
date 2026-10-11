<script lang="ts">
	import { page } from '$app/state';
	import Nav from '#lib/components/Nav.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import { setI18n, alternatePath, siteLinks, pageOf } from '#lib/i18n.ts';

	let { data, children } = $props();

	const i18n = setI18n(
		() => data.lang,
		() => data.texts
	);

	const pt = $derived(page.url.origin + alternatePath(page.url.pathname, 'pt'));
	const en = $derived(page.url.origin + alternatePath(page.url.pathname, 'en'));
	const links = $derived(
		siteLinks(i18n.t, i18n.lang, { drivers: data.pilots.length > 0, season: data.season.length > 0, news: data.hasNews })
	);
</script>

<svelte:head>
	<link rel="alternate" hreflang="pt-PT" href={pt} />
	<link rel="alternate" hreflang="en" href={en} />
	<link rel="alternate" hreflang="x-default" href={pt} />
	<meta property="og:locale" content={data.lang === 'pt' ? 'pt_PT' : 'en_GB'} />
	<meta property="og:site_name" content="K'ART Racing Team" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<Nav
	settings={data.settings}
	{links}
	current={pageOf(page.url.pathname)}
	altHref={alternatePath(page.url.pathname, i18n.t.lang.other)}
/>

{@render children()}

<Footer settings={data.settings} {links} />
