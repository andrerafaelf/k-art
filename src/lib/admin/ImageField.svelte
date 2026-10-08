<script lang="ts">
	import Icon from './Icon.svelte';

	interface Props {
		name: string;
		label: string;
		current?: string;
		hint?: string;
		error?: string;
		/** Offer a "remove" option for an existing image */
		removable?: boolean;
		svg?: boolean;
		/** Background behind the preview, for logos */
		tone?: 'dark' | 'light';
		wide?: boolean;
	}

	let { name, label, current, hint, error, removable = true, svg = false, tone = 'dark', wide }: Props = $props();

	let preview = $state<string>();
	let remove = $state(false);
	let tooBig = $state<string>();

	const MAX_MB = $derived(svg ? 4 : 8);

	function pick(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (preview) URL.revokeObjectURL(preview);
		preview = undefined;
		tooBig = undefined;
		// Catch oversized files here rather than after a slow upload
		if (file && file.size > MAX_MB * 1024 * 1024) {
			tooBig = `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. Use one under ${MAX_MB} MB.`;
			input.value = '';
			return;
		}
		preview = file ? URL.createObjectURL(file) : undefined;
		if (file) remove = false;
	}

	// Drop the local preview once the saved image comes back from the server
	$effect(() => {
		void current;
		preview = undefined;
		remove = false;
	});

	const shown = $derived(remove ? undefined : (preview ?? current));
	const accept = $derived(`image/jpeg,image/png,image/webp,image/avif${svg ? ',image/svg+xml' : ''}`);
</script>

<div class="a-field img" class:wide class:invalid={error}>
	<span class="a-label">{label}</span>
	<div class="box">
		<div class="preview {tone}">
			{#if shown}
				<img src={shown} alt="" />
			{:else}
				<Icon name="image" />
			{/if}
		</div>
		<div class="controls">
			<label class="btn btn-ghost pick">
				<input type="file" {name} {accept} onchange={pick} />
				{current || preview ? 'Replace image' : 'Upload image'}
			</label>
			{#if removable && current}
				<label class="a-switch">
					<input type="checkbox" name="{name}_remove" bind:checked={remove} />
					Remove
				</label>
			{/if}
			{#if tooBig || error}
				<p class="a-err">{tooBig ?? error}</p>
			{:else}
				<p class="a-hint">{hint ?? (svg ? 'JPG, PNG, WebP, AVIF or SVG.' : 'JPG, PNG, WebP or AVIF, up to 8 MB.')}</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.box {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem 1.25rem;
	}
	.preview {
		display: grid;
		place-items: center;
		width: 9rem;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		border: 1px solid var(--hair-2);
		border-radius: 6px;
		background: var(--input);
		color: var(--fg-3);
	}
	.preview.light {
		background: #efeee9;
	}
	.preview :global(svg) {
		width: 1.6rem;
	}
	.preview img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.preview.dark img {
		object-fit: cover;
	}
	.controls {
		display: grid;
		gap: 0.6rem;
		justify-items: start;
	}
	.pick {
		cursor: pointer;
	}
	.pick input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
	}
	.pick:has(input:focus-visible) {
		outline: 2px solid var(--lime);
		outline-offset: 3px;
	}
</style>
