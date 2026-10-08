<script lang="ts">
	import { page } from '$app/state';
	import Arrow from './Arrow.svelte';
	import { useI18n, calendarLinks } from '#lib/i18n.ts';

	let { label }: { label: string } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.calendar);
	const links = $derived(calendarLinks(page.url.host, i18n.lang));
</script>

<!-- Webcal for Apple Calendar and Outlook, Google's own subscribe page for
     Android and Gmail users, and the plain file for anything else -->
<div class="cal">
	<p class="label mono">{label}</p>
	<div class="links">
		<a href={links.webcal}>{t.apple} <Arrow dir="out" /></a>
		<a href={links.google} target="_blank" rel="noreferrer">{t.google} <Arrow dir="out" /></a>
		<a href={links.file} download title={t.fileTitle}>{t.file} <Arrow dir="down" /></a>
	</div>
</div>

<style>
	.cal {
		display: grid;
		gap: 0.85rem;
	}
	.label {
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-2);
	}
	/* On phones the subscription gets its own row, the other two share one */
	.links {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}
	.links a:first-child {
		grid-column: 1 / -1;
	}
	a {
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		height: 2.6rem;
		padding-inline: 0.95rem;
		border: 1px solid var(--hair-2);
		border-radius: 2px;
		font-family: var(--mono);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--fg);
		transition:
			border-color 0.3s,
			background-color 0.3s;
	}
	a:hover {
		border-color: var(--lime);
		background: rgb(214 249 6 / 0.06);
	}
	a :global(svg) {
		width: 0.7rem;
		color: var(--lime);
	}

	@media (min-width: 480px) {
		.links {
			display: flex;
			flex-wrap: wrap;
		}
	}
</style>
