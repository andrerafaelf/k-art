import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { slugify, type Post } from '#lib/content.ts';
import { getContent, update, newId } from '#lib/server/store.ts';
import { FormReader } from '#lib/server/form.ts';
import { readImage } from '#lib/server/images.ts';

const blank = (): Post => ({
	id: '',
	slug: '',
	title: { pt: '', en: '' },
	date: new Date().toISOString().slice(0, 10),
	excerpt: { pt: '', en: '' },
	body: { pt: '', en: '' },
	published: false
});

export const load: PageServerLoad = async ({ params }) => {
	const { posts } = await getContent();
	const post = params.id === 'new' ? blank() : posts.find((p) => p.id === params.id);
	if (!post) error(404, 'Post not found');
	return { post, isNew: params.id === 'new' };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const f = new FormReader(await request.formData());
		const content = await getContent();
		const existing = content.posts.find((p) => p.id === params.id);
		if (params.id !== 'new' && !existing) error(404, 'Post not found');

		const fields = {
			title: f.l('title', { required: true, max: 140 }),
			date: f.date('date'),
			excerpt: f.l('excerpt', { max: 300 }),
			body: f.l('body', { required: true, max: 20000 }),
			published: f.bool('published')
		};

		// The address is made from the Portuguese title unless one is typed in
		const slug = slugify(f.text('slug', { max: 80 }) || fields.title.pt);
		if (content.posts.some((p) => p.slug === slug && p.id !== existing?.id)) {
			f.error('slug', 'Another post already uses this address');
		}
		if (!f.ok) return f.fail();

		const cover = await readImage(f, 'cover', existing?.cover);
		if (!f.ok) return f.fail();

		const id = existing?.id ?? newId();
		await update((draft) => {
			const post: Post = { id, slug, ...fields, cover };
			if (!post.cover) delete post.cover;
			const i = draft.posts.findIndex((p) => p.id === id);
			if (i >= 0) draft.posts[i] = post;
			else draft.posts.push(post);
		});

		const message = fields.published ? 'Post saved and published' : 'Draft saved';
		if (!existing) redirect(303, `/admin/news/${id}?saved=${encodeURIComponent(message)}`);
		return { message };
	},

	delete: async ({ params }) => {
		await update((draft) => {
			draft.posts = draft.posts.filter((p) => p.id !== params.id);
		});
		redirect(303, `/admin/news?saved=${encodeURIComponent('Post deleted')}`);
	}
};
