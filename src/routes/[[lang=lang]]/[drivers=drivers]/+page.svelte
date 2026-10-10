<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import Pilots from '#lib/components/Pilots.svelte';
	import { useI18n } from '#lib/i18n.ts';

	let { data } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.drivers);
</script>

<Meta title={t.metaTitle(data.settings.seasonYear)} description={t.metaDescription} />

<main>
	<Pilots pilots={data.pilots} year={data.settings.seasonYear} />
</main>
