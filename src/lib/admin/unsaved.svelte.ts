import { SvelteSet } from 'svelte/reactivity';

/** Edit forms with typed changes that haven't been saved yet. The layout asks before leaving them. */
export const dirty = new SvelteSet<HTMLFormElement>();

/** Images still being prepared in the browser. Saving waits until they are ready. */
export const busy = $state({ count: 0 });

/** Watches a form for edits. Returns a function that stops watching. */
export function track(form: HTMLFormElement) {
	const mark = () => dirty.add(form);
	form.addEventListener('input', mark);
	form.addEventListener('change', mark);
	return () => {
		form.removeEventListener('input', mark);
		form.removeEventListener('change', mark);
		dirty.delete(form);
	};
}
