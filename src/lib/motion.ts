import type { Action } from 'svelte/action';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Marks a block as in view the first time it scrolls onscreen. Children with
 * `.rv` fade up and `.line > span` slide up (see app.css), staggered by `--d`.
 */
export const inview: Action<HTMLElement> = (node) => {
	if (reduced()) return;
	node.dataset.inview = '';

	const io = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				node.classList.add('is-in');
				io.disconnect();
			}
		},
		{ rootMargin: '0px 0px -12% 0px' }
	);
	io.observe(node);

	return { destroy: () => io.disconnect() };
};

/** Counts a number up from zero when it first comes into view. */
export const countup: Action<HTMLElement, number> = (node, value) => {
	if (reduced()) return;
	const fmt = new Intl.NumberFormat('en-GB');
	node.textContent = '0';

	let raf = 0;
	const io = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			io.disconnect();
			const start = performance.now();
			const step = (t: number) => {
				const p = Math.min((t - start) / 1600, 1);
				node.textContent = fmt.format(Math.round(value * (1 - Math.pow(1 - p, 4))));
				if (p < 1) raf = requestAnimationFrame(step);
			};
			raf = requestAnimationFrame(step);
		},
		{ threshold: 0.6 }
	);
	io.observe(node);

	return {
		destroy: () => {
			io.disconnect();
			cancelAnimationFrame(raf);
		}
	};
};
