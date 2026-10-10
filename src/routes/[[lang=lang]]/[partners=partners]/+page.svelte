<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import Partners from '#lib/components/Partners.svelte';
	import { useI18n } from '#lib/i18n.ts';

	let { data } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.partners);
</script>

<Meta title={t.metaTitle} description={t.metaDescription} />

<main>
	<Partners settings={data.settings} partners={data.partners} karts={data.pilots.length} />
</main>
