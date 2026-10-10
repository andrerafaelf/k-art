<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import Contact from '#lib/components/Contact.svelte';
	import { useI18n } from '#lib/i18n.ts';

	let { data, form } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.contact);
</script>

<Meta title={t.metaTitle} description={t.metaDescription} />

<main>
	<Contact settings={data.settings} result={form?.contact} />
</main>
