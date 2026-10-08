import type { SubmitFunction } from '$app/forms';

/** Submits without resetting what was typed, then clears file pickers once the save worked. */
export const keep: SubmitFunction = () => {
	return async ({ update, result, formElement }) => {
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
		if (!confirm(message)) cancel();
		return async ({ update }) => update();
	};
