<script lang="ts">
	import Arrow from './Arrow.svelte';
	import { tr, longDate, monthShort, type Post } from '#lib/content.ts';
	import { useI18n, newsPath } from '#lib/i18n.ts';

	let { post, feature = false }: { post: Omit<Post, 'body'>; feature?: boolean } = $props();

	const i18n = useI18n();
</script>

<a class="card" class:feature href={newsPath(i18n.lang, post.slug)}>
	<span class="cover">
		{#if post.cover}
			<img src={post.cover} alt="" loading="lazy" />
		{:else}
			<!-- Livery-style cover for posts without a photo -->
			<span class="art" aria-hidden="true">
				<span class="day num">{new Date(post.date).getUTCDate()}</span>
				<span class="mon">{monthShort(post.date, i18n.lang)}</span>
				<i class="s1"></i><i class="s2"></i>
			</span>
		{/if}
	</span>
	<span class="text">
		<time datetime={post.date}>{longDate(post.date, i18n.lang)}</time>
		<span class="title">{tr(post.title, i18n.lang)}</span>
		{#if tr(post.excerpt, i18n.lang)}
			<span class="excerpt">{tr(post.excerpt, i18n.lang)}</span>
		{/if}
		<span class="read">{i18n.t.news.read} <Arrow /></span>
	</span>
</a>

<style>
	.card {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.cover {
		position: relative;
		display: block;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		background: var(--bg-2);
	}
	.cover img,
	.art {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: scale 1.2s var(--ease-out);
	}
	.card:hover .cover img,
	.card:hover .art {
		scale: 1.04;
	}
	.art {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 1.25rem 1.5rem;
		background: linear-gradient(135deg, var(--bg-3), var(--bg-1));
		overflow: hidden;
	}
	.day {
		position: relative;
		z-index: 1;
		font-size: clamp(4.5rem, 9vw, 7rem);
	}
	.mon {
		position: relative;
		z-index: 1;
		margin-top: 0.3rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-2);
	}
	.art i {
		position: absolute;
		top: -10%;
		bottom: -10%;
		transform: skewX(-32deg);
	}
	.s1 {
		right: 22%;
		width: 16%;
		background: var(--lime);
	}
	.s2 {
		right: 10%;
		width: 4%;
		background: var(--cyan);
	}

	.text {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding-top: 1.4rem;
	}
	time {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.title {
		margin-top: 0.75rem;
		font-size: clamp(1.35rem, 2vw, 1.75rem);
		font-weight: 700;
		font-stretch: 110%;
		letter-spacing: -0.025em;
		line-height: 1.15;
		text-wrap: balance;
	}
	.feature .title {
		font-size: clamp(1.75rem, 3.2vw, 2.75rem);
	}
	.excerpt {
		margin-top: 0.75rem;
		color: var(--fg-2);
		text-wrap: pretty;
	}
	.read {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: auto;
		padding-top: 1.25rem;
		font-size: 0.875rem;
		font-weight: 600;
	}
	.read :global(svg) {
		width: 0.9rem;
		color: var(--lime);
		transition: translate 0.5s var(--ease-out);
	}
	.card:hover .read :global(svg) {
		translate: 4px 0;
	}
</style>
