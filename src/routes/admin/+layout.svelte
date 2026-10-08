<script lang="ts">
	import '#lib/admin/admin.css';
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import Logo from '#lib/components/Logo.svelte';
	import Icon, { type IconName } from '#lib/admin/Icon.svelte';

	let { data, children } = $props();

	const sections: { href: string; label: string; icon: IconName; count?: keyof typeof data.counts }[] = [
		{ href: '/admin', label: 'Overview', icon: 'overview' },
		{ href: '/admin/drivers', label: 'Drivers', icon: 'drivers', count: 'drivers' },
		{ href: '/admin/season', label: 'Calendar & results', icon: 'season', count: 'season' },
		{ href: '/admin/hall', label: 'Hall of Fame', icon: 'trophy', count: 'hall' },
		{ href: '/admin/news', label: 'News', icon: 'news', count: 'news' },
		{ href: '/admin/partners', label: 'Partners', icon: 'partners', count: 'partners' },
		{ href: '/admin/settings', label: 'Site settings', icon: 'settings' }
	];

	const active = (href: string) =>
		href === '/admin' ? page.url.pathname === '/admin' : page.url.pathname.startsWith(href);

	// Confirmation toast after a save, from the action result or a ?saved redirect
	let toast = $state<{ text: string; error: boolean }>();
	let timer: ReturnType<typeof setTimeout>;

	function show(text: string, error = false) {
		toast = { text, error };
		clearTimeout(timer);
		timer = setTimeout(() => (toast = undefined), error ? 6000 : 3200);
	}

	$effect(() => {
		const message = page.form?.message;
		if (typeof message === 'string') show(message, page.status >= 400);
	});

	// Pages that redirect after creating something pass the message as ?saved=
	afterNavigate(({ to }) => {
		const saved = to?.url.searchParams.get('saved');
		if (saved == null) return;
		show(saved || 'Saved');
		const url = new URL(to!.url.href);
		url.searchParams.delete('saved');
		goto(url, { replace: true, shallow: true, reset: false });
	});

	const savedAt = $derived(
		new Date(data.updatedAt).getTime() > 0
			? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data.updatedAt))
			: 'never'
	);
</script>

<svelte:head>
	<title>Admin, K'ART Racing Team</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="adm">
	<aside class="a-side">
		<a class="a-brand" href="/admin" aria-label="Admin overview">
			<Logo />
			<span>Admin</span>
		</a>
		<nav class="a-nav" aria-label="Admin">
			{#each sections as s}
				<a href={s.href} class:on={active(s.href)} aria-current={active(s.href) ? 'page' : undefined}>
					<Icon name={s.icon} />
					{s.label}
					{#if s.count}<span class="count">{data.counts[s.count]}</span>{/if}
				</a>
			{/each}
		</nav>
		<div class="a-foot">
			<a href="/" target="_blank" rel="noreferrer">View the site <Icon name="external" /></a>
			<span>Last saved {savedAt}</span>
			{#if data.admin}<span>Signed in as {data.admin}</span>{/if}
		</div>
	</aside>

	<main class="a-main">
		{@render children()}
	</main>
</div>

{#if toast}
	<div class="a-toast" class:error={toast.error} role="status">
		<Icon name={toast.error ? 'alert' : 'check'} />
		{toast.text}
	</div>
{/if}
