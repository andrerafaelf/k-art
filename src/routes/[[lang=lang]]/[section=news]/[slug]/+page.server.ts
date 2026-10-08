import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getContent } from '#lib/server/store.ts';
import { newsPath } from '#lib/i18n.ts';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { lang } = await parent();
	const { posts } = await getContent();
	const post = posts.find((p) => p.slug === params.slug && p.published);
	if (!post) error(404, 'Not found');
	if (params.section !== (lang === 'pt' ? 'noticias' : 'news')) redirect(308, newsPath(lang, post.slug));

	const others = posts
		.filter((p) => p.published && p.id !== post.id)
		.sort((a, b) => b.date.localeCompare(a.date))
		.slice(0, 2)
		.map(({ body: _, ...summary }) => summary);

	return { post, others };
};
