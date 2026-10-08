import { getRequestEvent } from '$app/server';
import { ADMIN_MESSAGES, type AdminMessages } from '#lib/admin/i18n.ts';

/** Admin text in the language of whoever made the current request, for messages made on the server. */
export function msg(): AdminMessages {
	try {
		return ADMIN_MESSAGES[getRequestEvent().locals.lang ?? 'pt'];
	} catch {
		return ADMIN_MESSAGES.pt;
	}
}
