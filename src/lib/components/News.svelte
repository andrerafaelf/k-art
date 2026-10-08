<script lang="ts">
	import SectionHead from './SectionHead.svelte';
	import PostCard from './PostCard.svelte';
	import Arrow from './Arrow.svelte';
	import type { Post } from '#lib/content.ts';
	import { useI18n, newsPath } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	let { posts, index }: { posts: Omit<Post, 'body'>[]; index: string } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.news);
</script>

<section id="news" class="news">
	<div class="wrap">
		<SectionHead {index} eyebrow={t.eyebrow} lines={t.title} accent={1}>
			<p>{t.intro}</p>
			<a class="all" href={newsPath(i18n.lang)}>{t.all} <Arrow /></a>
		</SectionHead>

		<ul class="posts" use:inview>
			{#each posts as post, i (post.id)}
				<li class="rv" style:--d="{i * 90}ms"><PostCard {post} /></li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.news {
		padding-block: var(--section);
	}
	.all {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: 1.25rem;
		font-weight: 600;
		color: var(--fg);
	}
	.all :global(svg) {
		width: 0.9rem;
		color: var(--lime);
	}
	.posts {
		display: grid;
		gap: 3rem 1.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	@media (min-width: 760px) {
		.posts {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (min-width: 1100px) {
		.posts {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
