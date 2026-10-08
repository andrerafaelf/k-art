import type { SubmitFunction } from '$app/forms';
import { dirty } from './unsaved.svelte.ts';

/** Submits without resetting what was typed, then clears file pickers once the save worked. */
export const keep: SubmitFunction = () => {
	return async ({ update, result, formElement }) => {
		if (result.type === 'success' || result.type === 'redirect') dirty.delete(formElement);
		await update({ reset: false });
		if (result.type === 'success') {
			for (const input of formElement.querySelectorAll<HTMLInputElement>('input[type=file]')) input.value = '';
		}
	};
};

/** Asks before running a destructive action. */
export const confirmFirst =
	(message: string): SubmitFunction =>
	({ cancel }) => {
		if (!confirm(message)) return cancel();
		// Deleting is a deliberate way out; don't also warn about unsaved edits
		dirty.clear();
		return async ({ update }) => update();
	};
