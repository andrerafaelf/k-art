// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Locals {
			/** Signed-in admin username, set by hooks.server.ts on /admin routes */
			admin?: string;
		}
	}
}

export {};
