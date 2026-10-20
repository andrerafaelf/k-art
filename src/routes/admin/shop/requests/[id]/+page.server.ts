import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getContent, update } from '#lib/server/store.ts';
import { editRequest, getRequests, removeRequest } from '#lib/server/requests.ts';
import { msg } from '#lib/server/lang.ts';
import { STATUSES, optionOf, stockOf, type RequestStatus } from '#lib/shop.ts';

async function find(id: string) {
	const request = (await getRequests()).find((r) => r.id === id);
	if (!request) error(404, 'Request not found');
	return request;
}

export const load: PageServerLoad = async ({ params }) => {
	const request = await find(params.id);
	const { products } = await getContent();
	// What is in stock now, next to what was asked for
	const now = request.lines.map((l) => {
		const p = products.find((x) => x.id === l.productId);
		if (!p) return undefined;
		const option = optionOf(p, l.optionId);
		return { slug: p.slug, stock: l.optionId && !option ? 0 : stockOf(p, option) };
	});
	return { request, now };
};

export const actions: Actions = {
	status: async ({ request, params }) => {
		const status = String((await request.formData()).get('status'));
		if (!STATUSES.includes(status as RequestStatus)) error(400, 'Unknown status');
		await editRequest(params.id, (r) => {
			r.status = status as RequestStatus;
		});
		return { message: msg().request.statusSaved };
	},

	/** Takes the quantities asked for off the stock, once. Each product it changes shows in History. */
	take: async ({ params, locals }) => {
		const r = await find(params.id);
		if (r.stockTaken) return { message: msg().request.takenToast };
		await update((draft) => {
			for (const line of r.lines) {
				const p = draft.products.find((x) => x.id === line.productId);
				if (!p) continue;
				const option = optionOf(p, line.optionId);
				if (option) option.stock = Math.max(option.stock - line.qty, 0);
				else if (!line.optionId) p.stock = Math.max(p.stock - line.qty, 0);
			}
		});
		await editRequest(r.id, (x) => {
			x.stockTaken = { at: new Date().toISOString(), by: locals.user?.name };
		});
		return { message: msg().request.takenToast };
	},

	delete: async ({ params }) => {
		await removeRequest(params.id);
		redirect(303, `/admin/shop/requests?saved=${encodeURIComponent(msg().request.removed)}`);
	}
};
