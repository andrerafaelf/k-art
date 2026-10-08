// The contact form's fields and results, shared by the form and the server
// (lib/server/contact.ts). Problems travel as codes and the form words them
// in the visitor's language (contact.errors in lib/i18n.ts).

export const TOPICS = ['drivers', 'partners', 'press', 'other'] as const;
export type Topic = (typeof TOPICS)[number];

export const LIMITS = { name: 100, email: 200, message: 4000, minMessage: 10 } as const;

/** The honeypot: hidden from people, filled in by bots */
export const HONEYPOT = 'pitboard';

// Cloudflare's always-pass test keys, used by the dev server when no real keys are set
export const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';
export const TURNSTILE_TEST_SECRET = '1x0000000000000000000000000000000AA';

export interface ContactValues {
	name: string;
	email: string;
	topic: Topic | '';
	message: string;
}

export type FieldError = 'name' | 'email' | 'short' | 'long';
export type FormError = 'bot' | 'busy' | 'failed';

export interface ContactSent {
	sent: true;
	name: string;
	email: string;
}

export interface ContactFailed {
	values: ContactValues;
	errors: Partial<Record<'name' | 'email' | 'message', FieldError>>;
	/** A problem with the whole form rather than one field */
	error?: FormError;
}

export type ContactResult = ContactSent | ContactFailed;
