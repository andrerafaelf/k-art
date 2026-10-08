import type { FormReader } from './form.ts';
import { saveUpload, UploadError } from './store.ts';

/**
 * Handles an image field on a form: a new upload replaces the current image,
 * the "remove" switch clears it, otherwise it stays as it is. Call this only
 * after the rest of the form is valid, so failed saves never leave stray files.
 * Replaced images stay on disk so that restoring a backup brings them back too.
 */
export async function readImage(
	f: FormReader,
	name: string,
	current: string | undefined,
	options?: { svg?: boolean; maxMb?: number }
): Promise<string | undefined> {
	const file = f.file(name);
	if (file) {
		try {
			return await saveUpload(file, { allowSvg: options?.svg, maxMb: options?.maxMb });
		} catch (e) {
			if (e instanceof UploadError) {
				f.error(name, e.message);
				return current;
			}
			throw e;
		}
	}
	if (f.bool(`${name}_remove`)) return undefined;
	return current;
}
