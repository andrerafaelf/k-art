<script lang="ts">
	import Arrow from './Arrow.svelte';

	// Only for people signed in to the admin: a link to edit what is on the page
	// and, for things visitors can't see yet, a note saying so. The page places it.

	let { href, label, notice }: { href: string; label: string; notice?: string } = $props();
</script>

<aside class="adminbar" class:preview={notice}>
	{#if notice}
		<p>
			<span class="dot" aria-hidden="true"></span>
			{notice}
		</p>
	{/if}
	<a {href}>{label} <Arrow /></a>
</aside>

<style>
	.adminbar {
		display: flex;
		align-items: center;
		gap: 0.75rem 1.25rem;
		max-width: calc(100vw - 2rem);
		padding: 0.5rem;
		border: 1px solid var(--hair-2);
		border-radius: 8px;
		background: rgb(18 20 24 / 0.94);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		box-shadow: 0 18px 50px rgb(0 0 0 / 0.5);
		font-size: 0.85rem;
	}
	.adminbar.preview {
		width: fit-content;
		flex-wrap: wrap;
		padding-left: 1rem;
	}
	p {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		line-height: 1.45;
		color: var(--fg-2);
	}
	.dot {
		flex-shrink: 0;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--plate);
		translate: 0 -0.05rem;
	}
	a {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		flex-shrink: 0;
		margin-left: auto;
		padding: 0.55rem 0.85rem;
		border-radius: 6px;
		background: var(--lime);
		color: var(--black);
		font-weight: 700;
	}
	a :global(svg) {
		width: 0.8rem;
	}
</style>
