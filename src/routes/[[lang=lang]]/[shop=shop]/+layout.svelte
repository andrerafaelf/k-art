<script lang="ts">
	import { page } from '$app/state';
	import ListBar from '#lib/components/ListBar.svelte';
	import AdminBar from '#lib/components/AdminBar.svelte';
	import { useI18n, LIST } from '#lib/i18n.ts';
	import { list } from '#lib/list.svelte.ts';

	// Around every page of the shop: the button to the list, and for people
	// signed in to the admin, a note when the shop or a product isn't public yet

	let { data, children } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.shop);
	const onList = $derived(page.params.list === LIST[i18n.lang]);
	const product = $derived(page.data.product as { visible: boolean } | undefined);
	const edit = $derived((page.data.edit as string | undefined) ?? '/admin/shop');
	const notice = $derived(data.closed ? t.preview : product && !product.visible ? t.hidden : undefined);

	// Room at the end of the page for the bars, so they never cover the footer
	$effect(() => {
		const room = (!onList && list.units > 0) || data.signedIn;
		document.body.style.paddingBottom = room ? '6rem' : '';
		return () => (document.body.style.paddingBottom = '');
	});
</script>

<svelte:head>
	{#if data.closed}<meta name="robots" content="noindex, nofollow" />{/if}
</svelte:head>

{@render children()}

<div class="dock" class:wide={notice}>
	{#if !onList}<ListBar />{/if}
	{#if data.signedIn}<AdminBar href={edit} label={t.edit} {notice} />{/if}
</div>

<style>
	/* Fixed to the bottom, the list button first, the admin bar under it */
	.dock {
		position: fixed;
		inset: auto 1rem calc(1rem + env(safe-area-inset-bottom, 0px));
		z-index: 150;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.6rem;
		pointer-events: none;
	}
	.dock > :global(*) {
		pointer-events: auto;
	}
	.dock.wide {
		align-items: center;
	}
	/* The list button stays on the right, above a centred preview note */
	.dock.wide > :global(.bar) {
		align-self: flex-end;
	}
	@media (max-width: 639px) {
		.dock {
			align-items: stretch;
		}
	}
</style>
