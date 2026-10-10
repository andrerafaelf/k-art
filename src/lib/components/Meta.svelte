<script lang="ts">
	import { page } from '$app/state';

	// Title, description and the social sharing card for a page
	let { title, description, image = '/og.png' }: { title: string; description: string; image?: string } = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="{page.url.origin}{image}" />
	{#if image === '/og.png'}
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
	{/if}
</svelte:head>
