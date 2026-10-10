<script lang="ts">
	import TeaserHead from './TeaserHead.svelte';
	import PostCard from './PostCard.svelte';
	import type { Post } from '#lib/content.ts';
	import { useI18n, newsPath } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	// The latest posts on the home page

	let { posts, index }: { posts: Omit<Post, 'body'>[]; index: string } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.news);
</script>

<section id="news" class="news" data-sector>
	<div class="wrap">
		<TeaserHead {index} eyebrow={t.eyebrow} lines={t.title} href={newsPath(i18n.lang)} link={t.all} />

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
		border-top: 1px solid var(--hair);
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
