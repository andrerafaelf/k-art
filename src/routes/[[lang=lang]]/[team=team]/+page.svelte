<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import Team from '#lib/components/Team.svelte';
	import Kerb from '#lib/components/Kerb.svelte';
	import Island from '#lib/components/Island.svelte';
	import { useI18n } from '#lib/i18n.ts';

	let { data } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.team);
</script>

<Meta title={t.metaTitle} description={t.metaDescription} />

<main>
	<Team page pilots={data.pilots} season={data.season} year={data.settings.seasonYear} />
	<Kerb />
	<Island />
</main>
