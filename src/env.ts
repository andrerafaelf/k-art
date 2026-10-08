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
	SITE_ALLOW_IPS: {
		schema: optional,
		description:
			'Before launch: comma-separated IPs or CIDR ranges that can open the site. Everyone else gets a holding page. Unset means open to everyone.'
	}
});
