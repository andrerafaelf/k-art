import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { isLive } from '#lib/content.ts';
import { getContent } from '#lib/server/store.ts';
import { newsPath } from '#lib/i18n.ts';

export const load: PageServerLoad = async ({ params, parent, locals, setHeaders }) => {
	const { lang } = await parent();
	const { posts } = await getContent();
	// Drafts and scheduled posts can be previewed here by anyone signed in to the admin
	const post = posts.find((p) => p.slug === params.slug && (isLive(p) || locals.user));
	if (!post) error(404, 'Not found');
	if (params.section !== (lang === 'pt' ? 'noticias' : 'news')) redirect(308, newsPath(lang, post.slug));

	const preview = !isLive(post);
	if (locals.user) setHeaders({ 'cache-control': 'private, no-store' });

	const others = posts
		.filter((p) => isLive(p) && p.id !== post.id)
		.sort((a, b) => b.date.localeCompare(a.date))
		.slice(0, 2)
		.map(({ body: _, ...summary }) => summary);

	return {
		post,
		others,
		preview: preview ? { scheduled: post.published } : undefined,
		edit: locals.user ? `/admin/news/${post.id}` : undefined
	};
};
