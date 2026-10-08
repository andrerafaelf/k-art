<script lang="ts">
	import { page } from '$app/state';
	import { setI18n, alternatePath } from '#lib/i18n.ts';

	let { data, children } = $props();

	setI18n(() => data.lang);

	const pt = $derived(page.url.origin + alternatePath(page.url.pathname, 'pt'));
	const en = $derived(page.url.origin + alternatePath(page.url.pathname, 'en'));
</script>

<svelte:head>
	<link rel="alternate" hreflang="pt-PT" href={pt} />
	<link rel="alternate" hreflang="en" href={en} />
	<link rel="alternate" hreflang="x-default" href={pt} />
	<meta property="og:locale" content={data.lang === 'pt' ? 'pt_PT' : 'en_GB'} />
	<meta property="og:site_name" content="K'ART Racing Team" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

{@render children()}
