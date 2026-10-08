<script lang="ts">
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import { t } from './i18n.ts';
	import { busy, dirty, track } from './unsaved.svelte.ts';

	// The bar at the bottom of every edit form. It watches its form for unsaved
	// edits, and when someone else saved the same item in the meantime it asks
	// what to do instead of overwriting their work.

	interface Props {
		/** Text on the save button */
		label?: string;
		/** Where Cancel goes */
		cancel?: string;
		/** Revision of the item as loaded, to notice changes made by someone else */
		rev?: string;
	}

	let { label, cancel, rev }: Props = $props();

	let bar: HTMLDivElement;
	let notice = $state<HTMLDivElement>();
	let form = $state<HTMLFormElement | null>(null);

	$effect(() => {
		form = bar.closest('form');
		return form ? track(form) : undefined;
	});

	const changed = $derived(!!form && dirty.has(form));
	const conflict = $derived((page.form as { conflict?: { name?: string; when?: string } } | null)?.conflict);

	$effect(() => {
		if (conflict) notice?.scrollIntoView({ block: 'center', behavior: 'smooth' });
	});
</script>

{#if rev}<input type="hidden" name="rev" value={rev} />{/if}

<div class="a-savebar" bind:this={bar}>
	<span class="a-help" class:changed>
		{#if changed}<span class="a-dot" aria-hidden="true"></span>{t().common.unsaved}{:else}{t().common.live}{/if}
	</span>
	<div class="a-actions">
		{#if cancel}<a class="btn btn-ghost" href={cancel}>{t().common.cancel}</a>{/if}
		<button class="btn" disabled={busy.count > 0}>{label ?? t().common.save}</button>
	</div>
</div>

<!-- After the save button, so pressing Enter in a field never saves over someone else's changes -->
{#if conflict}
	<div class="a-conflict" role="alert" bind:this={notice}>
		<Icon name="alert" />
		<div>
			<p class="a-conflict-title">{t().conflict.title}</p>
			<p>{t().conflict.body(conflict.name, conflict.when)}</p>
			<div class="a-actions">
				<a class="btn" href={page.url.pathname} data-sveltekit-reload onclick={() => dirty.clear()}>
					{t().conflict.reload}
				</a>
				<button class="btn btn-ghost" name="force" value="1">{t().conflict.force}</button>
			</div>
		</div>
	</div>
{/if}
