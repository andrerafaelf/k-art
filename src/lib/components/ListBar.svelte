<script lang="ts">
	import { fly } from 'svelte/transition';
	import Arrow from './Arrow.svelte';
	import { useI18n, listPath } from '#lib/i18n.ts';
	import { list } from '#lib/list.svelte.ts';

	// The way to the list from anywhere in the shop, once something is on it.
	// It says so for a moment each time something is added.

	const i18n = useI18n();
	const t = $derived(i18n.t.shop);

	let flash = $state(false);
	let seen = list.added;

	$effect(() => {
		if (list.added === seen) return;
		seen = list.added;
		flash = true;
		const timer = setTimeout(() => (flash = false), 1800);
		return () => clearTimeout(timer);
	});
</script>

{#if list.units > 0}
	<a class="bar" class:flash href={listPath(i18n.lang)} transition:fly={{ y: 24, duration: 500 }}>
		<span class="count" aria-hidden="true">{list.units}</span>
		<span class="label" aria-live="polite">{flash ? t.added : t.bar(list.units)}</span>
		<span class="go">{t.view} <Arrow /></span>
	</a>
{/if}

<style>
	.bar {
		--slant: 14px;
		display: flex;
		align-items: center;
		gap: 0.9rem;
		width: 100%;
		height: 3.5rem;
		padding: 0 calc(1.2rem + var(--slant)) 0 0.6rem;
		background: var(--lime);
		color: var(--black);
		clip-path: polygon(0 0, 100% 0, calc(100% - var(--slant)) 100%, 0 100%);
		box-shadow: 0 18px 50px rgb(0 0 0 / 0.5);
		font-weight: 700;
	}
	.count {
		display: grid;
		place-items: center;
		min-width: 2.4rem;
		height: 2.4rem;
		padding-inline: 0.4rem;
		background: var(--black);
		color: var(--lime);
		font-style: italic;
		font-stretch: 70%;
		font-weight: 800;
		font-size: 1.35rem;
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}
	.label {
		flex: 1;
		min-width: 0;
		font-size: 0.9375rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.go {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.875rem;
		white-space: nowrap;
	}
	.go :global(svg) {
		width: 0.9rem;
		transition: translate 0.5s var(--ease-out);
	}
	.bar:hover .go :global(svg) {
		translate: 3px 0;
	}
	.flash .count {
		animation: pop 0.5s var(--ease-out);
	}
	@keyframes pop {
		40% {
			transform: scale(1.18);
		}
	}

	@media (min-width: 640px) {
		.bar {
			width: auto;
			min-width: 22rem;
		}
	}
</style>
