<script lang="ts">
	import Meta from '#lib/components/Meta.svelte';
	import Hero from '#lib/components/Hero.svelte';
	import Kerb from '#lib/components/Kerb.svelte';
	import Team from '#lib/components/Team.svelte';
	import Lineup from '#lib/components/Lineup.svelte';
	import SeasonStrip from '#lib/components/SeasonStrip.svelte';
	import News from '#lib/components/News.svelte';
	import PartnersBand from '#lib/components/PartnersBand.svelte';
	import ContactBand from '#lib/components/ContactBand.svelte';
	import { useI18n } from '#lib/i18n.ts';

	// The home page gives a taste of each page and links on to it. Each section
	// is a sector of the lap, numbered in the order they appear and drawn along
	// the header as the page is read.

	let { data } = $props();

	const i18n = useI18n();

	const sectors = $derived(
		[
			'team',
			data.pilots.length ? 'drivers' : '',
			data.season.length ? 'season' : '',
			data.latest.length ? 'news' : '',
			'partners',
			'contact'
		].filter(Boolean)
	);
	const sector = (id: string) => `S${sectors.indexOf(id) + 1}`;
</script>

<Meta title={i18n.t.meta.title} description={i18n.t.meta.description} />

<main>
	<Hero pilots={data.pilots} season={data.season} settings={data.settings} />
	<Kerb />
	<Team pilots={data.pilots} season={data.season} year={data.settings.seasonYear} index={sector('team')} />
	{#if data.pilots.length}
		<Lineup pilots={data.pilots} year={data.settings.seasonYear} index={sector('drivers')} />
	{/if}
	{#if data.season.length}
		<SeasonStrip season={data.season} year={data.settings.seasonYear} index={sector('season')} />
	{/if}
	{#if data.latest.length}
		<News posts={data.latest} index={sector('news')} />
	{/if}
	<PartnersBand
		settings={data.settings}
		partners={data.partners}
		karts={data.pilots.length}
		index={sector('partners')}
	/>
	<ContactBand settings={data.settings} index={sector('contact')} />
</main>
