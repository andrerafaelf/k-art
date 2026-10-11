<script lang="ts">
	import '#lib/admin/admin.css';
	import { page } from '$app/state';
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
	import Logo from '#lib/components/Logo.svelte';
	import Icon, { type IconName } from '#lib/admin/Icon.svelte';
	import { t, when } from '#lib/admin/i18n.ts';
	import { dirty } from '#lib/admin/unsaved.svelte.ts';

	let { data, children } = $props();

	type Counts = NonNullable<typeof data.counts>;
	const sections = $derived<{ href: string; label: string; icon: IconName; count?: keyof Counts }[]>([
		{ href: '/admin', label: t().nav.overview, icon: 'overview' },
		{ href: '/admin/drivers', label: t().nav.drivers, icon: 'drivers', count: 'drivers' },
		{ href: '/admin/season', label: t().nav.season, icon: 'season', count: 'season' },
		{ href: '/admin/hall', label: t().nav.hall, icon: 'trophy', count: 'hall' },
		{ href: '/admin/news', label: t().nav.news, icon: 'news', count: 'news' },
		{ href: '/admin/partners', label: t().nav.partners, icon: 'partners', count: 'partners' },
		{ href: '/admin/texts', label: t().nav.texts, icon: 'texts' },
		{ href: '/admin/settings', label: t().nav.settings, icon: 'settings' },
		{ href: '/admin/history', label: t().nav.history, icon: 'history' }
	]);

	const active = (href: string) =>
		href === '/admin' ? page.url.pathname === '/admin' : page.url.pathname.startsWith(href);
	const current = $derived(
		active('/admin/account') ? t().nav.account : (sections.find((s) => active(s.href))?.label ?? t().nav.overview)
	);

	let menu = $state<HTMLDialogElement>();

	// Confirmation toast after a save, from the action result or a ?saved redirect
	let toast = $state<{ text: string; error: boolean }>();
	let timer: ReturnType<typeof setTimeout>;

	function show(text: string, error = false) {
		toast = { text, error };
		clearTimeout(timer);
		timer = setTimeout(() => (toast = undefined), error ? 7000 : 3200);
	}

	$effect(() => {
		const message = page.form?.message;
		if (typeof message === 'string') show(message, page.status >= 400);
	});

	// Leaving a form with unsaved changes asks first. Closing the tab or typing
	// another address gets the browser's own question.
	beforeNavigate(({ cancel, type, to }) => {
		if (!dirty.size) return;
		if (type === 'leave') return cancel();
		if (to?.url.pathname === page.url.pathname) return;
		if (confirm(t().common.leave)) dirty.clear();
		else cancel();
	});

	// Pages that redirect after creating something pass the message as ?saved=
	afterNavigate(({ to }) => {
		menu?.close();
		const saved = to?.url.searchParams.get('saved');
		if (saved == null) return;
		show(saved || t().common.saved);
		const url = new URL(to!.url.href);
		url.searchParams.delete('saved');
		goto(url, { replace: true, shallow: true, reset: false });
	});
</script>

<svelte:head>
	<title>{t().nav.title}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if data.user}
	{#snippet links()}
		<nav class="a-nav" aria-label={t().nav.label}>
			{#each sections as s}
				<a href={s.href} class:on={active(s.href)} aria-current={active(s.href) ? 'page' : undefined}>
					<Icon name={s.icon} />
					{s.label}
					{#if s.count && data.counts}<span class="count">{data.counts[s.count]}</span>{/if}
				</a>
			{/each}
		</nav>
	{/snippet}

	{#snippet foot()}
		<div class="a-foot">
			{#if data.last}
				<p class="a-last">{t().nav.last(data.last.name, when(data.last.at, t()))}</p>
			{/if}
			<a href="/" target="_blank" rel="noreferrer"><Icon name="external" /> {t().nav.site}</a>
			<a href="/admin/account" class:on={active('/admin/account')}>
				<Icon name="user" />
				<span class="me">{data.user?.name}<small>{t().nav.account}</small></span>
			</a>
			<form method="post" action="/admin/logout">
				<button><Icon name="signout" /> {t().nav.signOut}</button>
			</form>
		</div>
	{/snippet}

	<div class="adm">
		<aside class="a-side">
			<a class="a-brand" href="/admin" aria-label={t().nav.home}>
				<Logo />
				<span>{t().nav.label}</span>
			</a>
			<span class="a-here">{current}</span>
			<button class="a-menu-btn" aria-haspopup="dialog" onclick={() => menu?.showModal()}>
				<Icon name="menu" />
				{t().nav.menu}
			</button>
			<div class="a-desk">
				{@render links()}
				{@render foot()}
			</div>
		</aside>

		<main class="a-main">
			{@render children()}
		</main>
	</div>

	<!-- Phones and tablets: the whole menu in one sheet -->
	<dialog class="a-sheet" bind:this={menu} aria-label={t().nav.label} onclick={(e) => e.target === menu && menu?.close()}>
		<div class="a-sheet-in">
			<div class="a-sheet-head">
				<span class="a-brand"><Logo /><span>{t().nav.label}</span></span>
				<button class="a-icon-btn" aria-label={t().nav.close} onclick={() => menu?.close()}><Icon name="close" /></button>
			</div>
			{@render links()}
			{@render foot()}
		</div>
	</dialog>
{:else}
	<div class="adm a-solo">
		{@render children()}
	</div>
{/if}

{#if toast}
	<div class="a-toast" class:error={toast.error} role="status">
		<Icon name={toast.error ? 'alert' : 'check'} />
		{toast.text}
	</div>
{/if}
