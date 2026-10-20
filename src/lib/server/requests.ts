import path from 'node:path';
import type { L, Lang } from '#lib/content.ts';
import type { RequestStatus } from '#lib/shop.ts';
import { dataDir, newId, readJson, writeAtomic } from './files.ts';

// Lists sent from the shop. They hold people's names and contact details, so
// they live in a file of their own, apart from the site's content, its backups
// and its history: going back to an older version of the site never brings
// back or removes a request. Finished requests are deleted a year after they
// were sent.

const file = path.join(dataDir, 'requests.json');
const KEEP_DONE_DAYS = 365;

export interface RequestLine {
	productId: string;
	optionId?: string;
	/** As it was when the request was sent, so it reads the same after the shop changes */
	name: L;
	option?: string;
	ref?: string;
	qty: number;
	/** Price of one in cents, missing when on request */
	unit?: number;
}

export interface ShopRequest {
	id: string;
	/** Counts up from 1, for "Pedido n.º 12" */
	number: number;
	at: string;
	/** The language of the site it was sent from */
	lang: Lang;
	name: string;
	email: string;
	phone?: string;
	message?: string;
	lines: RequestLine[];
	/** Sum of the priced lines, in cents */
	total: number;
	status: RequestStatus;
	/** When its quantities were taken off the stock, and by whom */
	stockTaken?: { at: string; by?: string };
}

let cache: Promise<ShopRequest[]> | undefined;
let queue: Promise<unknown> = Promise.resolve();

const expired = (r: ShopRequest, now: number) =>
	r.status === 'done' && now - Date.parse(r.at) > KEEP_DONE_DAYS * 86_400_000;

/** Every request, newest first. */
export function getRequests(): Promise<ShopRequest[]> {
	cache ??= readJson<ShopRequest[]>(file)
		.then((list) => (list ?? []).filter((r) => !expired(r, Date.now())))
		.catch((e) => {
			cache = undefined;
			throw e;
		});
	return cache;
}

/** Changes the requests one at a time and saves them. */
function change<T>(fn: (list: ShopRequest[]) => T): Promise<T> {
	const run = queue.then(async () => {
		const list = structuredClone(await getRequests());
		const result = fn(list);
		const kept = list.filter((r) => !expired(r, Date.now())).sort((a, b) => b.number - a.number);
		await writeAtomic(file, JSON.stringify(kept, null, '\t'));
		cache = Promise.resolve(kept);
		return result;
	});
	queue = run.catch(() => {});
	return run;
}

export function addRequest(request: Omit<ShopRequest, 'id' | 'number' | 'at' | 'status'>) {
	return change((list) => {
		const saved: ShopRequest = {
			id: newId(),
			number: list.reduce((n, r) => Math.max(n, r.number), 0) + 1,
			at: new Date().toISOString(),
			status: 'new',
			...request
		};
		list.push(saved);
		return saved;
	});
}

export function editRequest(id: string, edit: (r: ShopRequest) => void) {
	return change((list) => {
		const r = list.find((x) => x.id === id);
		if (r) edit(r);
		return r;
	});
}

export function removeRequest(id: string) {
	return change((list) => {
		const i = list.findIndex((r) => r.id === id);
		if (i >= 0) list.splice(i, 1);
	});
}
