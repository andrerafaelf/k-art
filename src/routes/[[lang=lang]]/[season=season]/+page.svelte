<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import Season from '#lib/components/Season.svelte';
	import { useI18n } from '#lib/i18n.ts';

	let { data } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.season);
</script>

<Meta title={t.metaTitle(data.settings.seasonYear)} description={t.metaDescription} />

<main>
	<Season season={data.season} settings={data.settings} />
</main>
