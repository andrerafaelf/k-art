<script lang="ts">
	import Icon from './Icon.svelte';
	import { t } from './i18n.ts';
	import { prepare } from './photo.ts';
	import { busy } from './unsaved.svelte.ts';

	// Several photos for one item, the first being the main one. Saved photos
	// and new ones can be removed or made the main one; new ones are made
	// smaller and lose their location in the browser before they are sent. The
	// order travels as "k:<saved address>" and "n:<new file number>".

	interface Props {
		name: string;
		label: string;
		current: string[];
		max: number;
		error?: string;
	}

	let { name, label, current, max, error }: Props = $props();

	type Photo = { kind: 'saved'; src: string } | { kind: 'new'; src: string; file: File };

	let photos = $state<Photo[]>([]);
	// Start from the saved photos, and again whenever a save brings them back
	$effect.pre(() => {
		photos = current.map((src) => ({ kind: 'saved', src }));
	});

	let upload = $state<HTMLInputElement>();
	let preparing = $state(false);
	let problem = $state<string>();

	const added = $derived(photos.filter((p) => p.kind === 'new'));
	const order = $derived(photos.map((p) => (p.kind === 'saved' ? `k:${p.src}` : `n:${added.indexOf(p)}`)));

	/** The new files go in a hidden picker that is sent with the form, in the order they were added */
	$effect(() => {
		if (!upload) return;
		const files = new DataTransfer();
		for (const p of added) if (p.kind === 'new') files.items.add(p.file);
		upload.files = files.files;
	});

	async function pick(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const files = [...(input.files ?? [])];
		input.value = '';
		problem = undefined;
		if (!files.length) return;

		preparing = true;
		busy.count++;
		try {
			for (const file of files) {
				if (photos.length >= max) {
					problem = t().product.tooMany(max);
					break;
				}
				const ready = await prepare(file);
				if (ready.size > 8 * 1024 * 1024) {
					problem = t().image.tooBig((ready.size / 1024 / 1024).toFixed(1), 8);
					continue;
				}
				photos.push({ kind: 'new', src: URL.createObjectURL(ready), file: ready });
			}
			input.closest('form')?.dispatchEvent(new Event('change', { bubbles: true }));
		} finally {
			preparing = false;
			busy.count--;
		}
	}

	function main(i: number) {
		const [p] = photos.splice(i, 1);
		photos.unshift(p);
		upload?.closest('form')?.dispatchEvent(new Event('change', { bubbles: true }));
	}

	function remove(i: number) {
		const [p] = photos.splice(i, 1);
		if (p.kind === 'new') URL.revokeObjectURL(p.src);
		upload?.closest('form')?.dispatchEvent(new Event('change', { bubbles: true }));
	}
</script>

<div class="a-field wide" class:invalid={error || problem}>
	<span class="a-label">{label}</span>

	{#each order as value}<input type="hidden" name="{name}.order" value={value} />{/each}
	<input class="hidden" type="file" name="{name}.new" multiple bind:this={upload} tabindex="-1" aria-hidden="true" />

	<ul class="photos">
		{#each photos as p, i (p.src)}
			<li class:main={i === 0}>
				<img src={p.src} alt="" />
				{#if i === 0}<span class="badge">{t().product.main}</span>{/if}
				<span class="tools">
					{#if i > 0}
						<button type="button" class="a-icon-btn" onclick={() => main(i)} aria-label={t().product.makeMain} title={t().product.makeMain}>
							<Icon name="star" />
						</button>
					{/if}
					<button
						type="button"
						class="a-icon-btn danger"
						onclick={() => remove(i)}
						aria-label={t().product.removePhoto}
						title={t().product.removePhoto}
					>
						<Icon name="trash" />
					</button>
				</span>
			</li>
		{/each}
		{#if photos.length < max}
			<li class="add">
				<label class:loading={preparing}>
					<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onchange={pick} />
					<Icon name="plus" />
					<span>{preparing ? t().image.preparing : t().product.addPhotos}</span>
				</label>
			</li>
		{/if}
	</ul>

	{#if problem || error}
		<p class="a-err">{problem ?? error}</p>
	{:else}
		<p class="a-hint">{t().product.photosHint(max)}</p>
	{/if}
</div>

<style>
	.hidden {
		display: none;
	}
	.photos {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(7.5rem, 1fr));
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		border: 1px solid var(--hair-2);
		border-radius: 6px;
		background: var(--input);
	}
	li.main {
		border-color: var(--lime);
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.badge {
		position: absolute;
		top: 0.4rem;
		left: 0.4rem;
		padding: 0.15rem 0.45rem;
		border-radius: 4px;
		background: var(--lime);
		color: var(--black);
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.tools {
		position: absolute;
		right: 0.3rem;
		bottom: 0.3rem;
		display: flex;
		gap: 0.25rem;
	}
	.tools :global(.a-icon-btn) {
		background: rgb(10 11 12 / 0.8);
	}
	.add {
		border-style: dashed;
	}
	.add label {
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 0.4rem;
		height: 100%;
		padding: 0.5rem;
		color: var(--fg-2);
		font-size: 0.8rem;
		text-align: center;
		cursor: pointer;
		transition: color 0.2s;
	}
	.add label:hover {
		color: var(--fg);
	}
	.add label.loading {
		opacity: 0.5;
	}
	.add input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
	}
	.add label:has(input:focus-visible) {
		outline: 2px solid var(--lime);
		outline-offset: -2px;
	}
	.add :global(svg) {
		width: 1.3rem;
	}
</style>
