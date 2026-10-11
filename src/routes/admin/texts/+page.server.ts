import type { PageServerLoad } from './$types';
import { getContent } from '#lib/server/store.ts';
import { GROUPS, type TextKey } from '#lib/texts.ts';
import type { L } from '#lib/content.ts';

export const load: PageServerLoad = async () => {
	const { texts } = await getContent();
	const missingEn = (v: L<string> | L<string[]> | undefined) => {
		const has = (x: string | string[] | undefined) => (Array.isArray(x) ? x.some((s) => s.trim()) : !!x?.trim());
		return !!v && has(v.pt) && !has(v.en);
	};
	return {
		pages: GROUPS.map((g) => ({
			id: g.id,
			count: g.fields.length,
			noEnglish: g.fields.some((f) => missingEn(texts[f.key as TextKey]))
		}))
	};
};
