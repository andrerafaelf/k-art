import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	ADMIN_USER: {
		schema: optional,
		description: 'Username for /admin. The admin stays locked until both ADMIN_USER and ADMIN_PASSWORD are set.'
	},
	ADMIN_PASSWORD: {
		schema: optional,
		description: 'Password for /admin. Use a long random string in production.'
	},
	DATA_DIR: {
		schema: (value) => value || 'data',
		description: 'Folder for content.json, backups and uploaded images. Must survive redeploys.'
	},
	SITE_ALLOW_IPS: {
		schema: optional,
		description:
			'Before launch: comma-separated IPs or CIDR ranges that can open the site. Everyone else gets a holding page. Unset means open to everyone.'
	}
});
