import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	ADMIN_USER: {
		schema: optional,
		description:
			'Username for the first admin account, created on first start when no accounts exist yet. After that, accounts are managed in the admin.'
	},
	ADMIN_PASSWORD: {
		schema: optional,
		description: 'Password for the first admin account. Use a long random string, and change it after signing in.'
	},
	DATA_DIR: {
		schema: (value) => value || 'data',
		description: 'Folder for content, accounts, the change log, backups and uploaded images. Must survive redeploys.'
	},
	RESEND_API_KEY: {
		schema: optional,
		description:
			'Resend API key for the contact form, from the same Resend account as Vexara and the portfolio. k-artracing.com must be a verified domain there. Unset on the dev server prints messages instead of sending them.'
	},
	CONTACT_TO: {
		schema: (value) => value || 'geral@k-artracing.com',
		description: 'Where contact form messages go. Cloudflare Email Routing forwards geral@k-artracing.com to the team.'
	},
	CONTACT_FROM: {
		schema: (value) => value || 'site@k-artracing.com',
		description: 'Sender address of contact form messages. Its domain must be verified in Resend.'
	},
	TURNSTILE_SITE_KEY: {
		public: true,
		schema: optional,
		description:
			"Cloudflare Turnstile site key for the contact form, public. Unset on the dev server uses Cloudflare's always-pass test key."
	},
	TURNSTILE_SECRET_KEY: {
		schema: optional,
		description: 'Cloudflare Turnstile secret key, checks that a contact form message came from a person.'
	},
	SITE_ALLOW_IPS: {
		schema: optional,
		description:
			'Before launch: comma-separated IPs or CIDR ranges that can open the site. Everyone else gets a holding page. Unset means open to everyone.'
	}
});
