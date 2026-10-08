import type { Action } from 'svelte/action';

// Cloudflare Turnstile for the contact form. The script is fetched only once
// the form comes near the screen, and the widget stays hidden unless
// Cloudflare wants the visitor to tick a box. lib/server/contact.ts checks the
// token it hands the browser.

interface Api {
	render: (el: HTMLElement, options: Record<string, unknown>) => string;
	reset: (id: string) => void;
	remove: (id: string) => void;
}

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading: Promise<Api> | undefined;

function load(): Promise<Api> {
	const w = window as Window & { turnstile?: Api };
	if (w.turnstile) return Promise.resolve(w.turnstile);
	loading ??= new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = SCRIPT;
		script.async = true;
		script.onload = () => (w.turnstile ? resolve(w.turnstile) : reject(new Error('Turnstile missing')));
		script.onerror = () => {
			loading = undefined;
			reject(new Error('Turnstile failed to load'));
		};
		document.head.append(script);
	});
	return loading;
}

export function createTurnstile(siteKey: string) {
	let api: Api | undefined;
	let id: string | undefined;
	let token = '';
	/** The script could not load, an ad blocker for example */
	let blocked = false;
	let waiting: ((token: string) => void)[] = [];

	const settle = (value: string) => {
		token = value;
		for (const resolve of waiting.splice(0)) resolve(value);
	};

	/** Renders the widget into this element once it nears the screen. */
	const mount: Action<HTMLElement> = (node) => {
		let gone = false;
		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				io.disconnect();
				load()
					.then((turnstile) => {
						if (gone) return;
						api = turnstile;
						id = turnstile.render(node, {
							sitekey: siteKey,
							action: 'contact',
							theme: 'light',
							size: 'flexible',
							appearance: 'interaction-only',
							callback: settle,
							'expired-callback': () => (token = ''),
							'error-callback': () => settle('')
						});
					})
					.catch(() => {
						blocked = true;
						settle('');
					});
			},
			{ rootMargin: '600px 0px' }
		);
		io.observe(node);

		return {
			destroy() {
				gone = true;
				io.disconnect();
				if (api && id) api.remove(id);
				id = undefined;
				token = '';
			}
		};
	};

	return {
		mount,
		/** The token, waiting for the check to finish if it is still running. Empty if it fails or takes too long. */
		token(timeout = 15_000): Promise<string> {
			if (token || blocked) return Promise.resolve(token);
			return new Promise((resolve) => {
				waiting.push(resolve);
				setTimeout(() => {
					waiting = waiting.filter((r) => r !== resolve);
					resolve('');
				}, timeout);
			});
		},
		/** Tokens work once, so ask for a new one after each attempt. */
		reset() {
			token = '';
			if (api && id) api.reset(id);
		}
	};
}
