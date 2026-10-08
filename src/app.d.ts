// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Locals {
			/** The signed-in admin, set by hooks.server.ts from the session cookie */
			user?: import('#lib/server/auth.ts').SignedIn;
			/** Id of the current session, for signing out */
			session?: string;
			/** Admin interface language, set on /admin routes */
			lang?: import('#lib/content.ts').Lang;
		}
	}
}

export {};
