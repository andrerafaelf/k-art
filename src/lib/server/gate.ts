import type { RequestEvent } from '@sveltejs/kit';
import { BlockList, isIP } from 'node:net';
import { SITE_ALLOW_IPS } from '$app/env/private';

// Before launch the site can be limited to a few addresses with SITE_ALLOW_IPS
// (comma-separated IPs or CIDR ranges, IPv4 and IPv6). Everyone else gets a
// holding page. The address comes from X-Forwarded-For (ADDRESS_HEADER), which
// nginx builds from Cloudflare's real client IP, so it can't be spoofed.
// Static build files (scripts, styles, fonts, the logo) are served before the
// hooks run and stay public; pages, the admin and uploads are covered.
//
// /healthz answers either way, for the deploy checks.

const allowList = SITE_ALLOW_IPS ? parse(SITE_ALLOW_IPS) : undefined;

function parse(value: string) {
	const list = new BlockList();
	for (const entry of value.split(',').map((s) => s.trim()).filter(Boolean)) {
		const [address, bits] = entry.split('/');
		const family = isIP(address);
		if (!family) throw new Error(`SITE_ALLOW_IPS: "${entry}" is not an IP address or CIDR range`);
		const type = family === 6 ? 'ipv6' : 'ipv4';
		if (bits === undefined) list.addAddress(address, type);
		else list.addSubnet(address, Number(bits), type);
	}
	return list;
}

function allowed(event: RequestEvent) {
	let address: string;
	try {
		address = event.getClientAddress();
	} catch {
		// No X-Forwarded-For, so the request did not come through nginx
		return false;
	}
	const family = isIP(address);
	return family !== 0 && allowList!.check(address, family === 6 ? 'ipv6' : 'ipv4');
}

const text = (status: number, body: string) =>
	new Response(body, {
		status,
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'no-store',
			'x-robots-tag': 'noindex, nofollow'
		}
	});

/** A response when the request must not reach the site, otherwise undefined. */
export function gate(event: RequestEvent) {
	if (event.url.pathname === '/healthz') return text(200, 'ok\n');
	if (!allowList || allowed(event)) return undefined;
	return text(
		403,
		"K'ART Racing Team\n\nO site está quase pronto. Volte em breve.\nThe site is almost ready. Check back soon.\n"
	);
}
