<script lang="ts">
	import { useI18n } from '#lib/i18n.ts';

	// A product's photos: swipe or scroll through them, or pick one below.
	// Shown whole, never cropped, so a part can be seen end to end.

	let { photos, alt }: { photos: string[]; alt: string } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.shop);

	let track = $state<HTMLDivElement>();
	let current = $state(0);

	function go(i: number) {
		track?.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
	}

	function onscroll() {
		if (track) current = Math.round(track.scrollLeft / track.clientWidth);
	}
</script>

<div class="gallery">
	<div class="track" bind:this={track} {onscroll}>
		{#each photos as src, i}
			<figure aria-label={photos.length > 1 ? t.photo(i + 1, photos.length) : undefined}>
				<img {src} alt={i === 0 ? alt : ''} loading={i === 0 ? 'eager' : 'lazy'} />
			</figure>
		{/each}
	</div>
	{#if photos.length > 1}
		<div class="thumbs">
			{#each photos as src, i}
				<button
					type="button"
					class:on={current === i}
					aria-label={t.photo(i + 1, photos.length)}
					aria-current={current === i ? 'true' : undefined}
					onclick={() => go(i)}
				>
					<img {src} alt="" loading="lazy" />
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.track {
		display: flex;
		aspect-ratio: 1;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		background: var(--bg-2);
	}
	.track::-webkit-scrollbar {
		display: none;
	}
	figure {
		flex: 0 0 100%;
		scroll-snap-align: start;
	}
	figure img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.thumbs {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.thumbs button {
		position: relative;
		flex: 0 0 4.5rem;
		aspect-ratio: 1;
		background: var(--bg-2);
		opacity: 0.55;
		transition: opacity 0.3s;
	}
	.thumbs button:hover,
	.thumbs .on {
		opacity: 1;
	}
	.thumbs .on::after {
		content: '';
		position: absolute;
		inset: auto 0 0;
		height: 3px;
		background: var(--lime);
	}
	.thumbs img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
