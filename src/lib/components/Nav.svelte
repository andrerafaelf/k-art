<script lang="ts">
	import Logo from './Logo.svelte';
	import Arrow from './Arrow.svelte';
	import type { Settings } from '#lib/content.ts';
	import { useI18n, localize } from '#lib/i18n.ts';

	interface Props {
		settings: Settings;
		links: { id: string; href: string; label: string }[];
		/** Same page in the other language */
		altHref: string;
	}

	let { settings, links, altHref }: Props = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t);

	let open = $state(false);
	let solid = $state(false);
	let hidden = $state(false);
	let current = $state('');

	// Solid once scrolled, tucks away while scrolling down, comes back on the way up
	$effect(() => {
		let last = scrollY;
		const onScroll = () => {
			const y = scrollY;
			solid = y > 40;
			if (Math.abs(y - last) > 6) {
				hidden = y > last && y > 400;
				last = y;
			}
		};
		onScroll();
		addEventListener('scroll', onScroll, { passive: true });
		return () => removeEventListener('scroll', onScroll);
	});

	// Highlight the section currently in view
	$effect(() => {
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) if (e.isIntersecting) current = e.target.id;
			},
			{ rootMargin: '-45% 0px -50% 0px' }
		);
		for (const { id } of links) {
			const el = document.getElementById(id);
			if (el) io.observe(el);
		}
		return () => io.disconnect();
	});

	$effect(() => {
		if (open) hidden = false;
		document.documentElement.style.overflow = open ? 'hidden' : '';
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<header class:solid class:hidden={hidden && !open} class:open>
	<div class="bar wrap">
		<a href={localize('/', i18n.lang)} class="brand" aria-label={t.nav.home} onclick={() => (open = false)}>
			<Logo />
		</a>

		<nav aria-label="Main" class="desk">
			{#each links.filter((l) => l.id !== 'contact') as link}
				<a href={link.href} class:current={current === link.id}>{link.label}</a>
			{/each}
		</nav>

		<a class="lang" href={altHref} hreflang={t.lang.other === 'pt' ? 'pt-PT' : 'en'} lang={t.lang.other}>
			<span class="sr-only">{t.lang.label}</span>
			<span aria-hidden="true">{t.lang.short}</span>
		</a>

		<a class="btn cta" href={links.find((l) => l.id === 'contact')?.href}>{t.nav.cta} <Arrow /></a>

		<button class="menu-btn" aria-expanded={open} aria-controls="menu" onclick={() => (open = !open)}>
			<span class="sr-only">{open ? t.nav.close : t.nav.open}</span>
			<span class="bars" aria-hidden="true"><i></i><i></i></span>
		</button>
	</div>
</header>

<div id="menu" class="sheet" class:open inert={!open}>
	<nav aria-label="Mobile">
		{#each links as link, i}
			<a href={link.href} style:--i={i} onclick={() => (open = false)}>
				<span>{link.label}</span>
				<Arrow />
			</a>
		{/each}
	</nav>
	<div class="sheet-foot">
		<a href="mailto:{settings.email}">{settings.email}</a>
		<a href={altHref} lang={t.lang.other}>{t.lang.label}</a>
	</div>
</div>

<style>
	header {
		position: fixed;
		inset: 0 0 auto;
		z-index: 60;
		padding-top: env(safe-area-inset-top, 0px);
		transition:
			transform 0.6s var(--ease-out),
			background-color 0.4s,
			backdrop-filter 0.4s;
	}
	header.solid {
		background: rgb(8 9 10 / 0.72);
		backdrop-filter: blur(18px) saturate(160%);
		-webkit-backdrop-filter: blur(18px) saturate(160%);
		box-shadow: 0 1px 0 var(--hair);
	}
	header.open {
		background: var(--bg);
		box-shadow: none;
	}
	header.hidden {
		transform: translateY(-100%);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: 2rem;
		height: var(--nav-h);
	}
	/* The full lockup, as in the footer; wide enough for RACING TEAM to read */
	.brand {
		width: 9.5rem;
		flex-shrink: 0;
	}

	.desk {
		display: none;
	}

	.cta {
		display: none;
		height: 2.6rem;
		padding: 0 1rem 0 1.15rem;
		font-size: 0.875rem;
	}

	.menu-btn {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		margin-right: -0.6rem;
	}

	.lang {
		display: grid;
		place-items: center;
		min-width: 2.6rem;
		height: 2.6rem;
		margin-left: auto;
		padding-inline: 0.6rem;
		border: 1px solid var(--hair-2);
		border-radius: 2px;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--fg-2);
		transition:
			color 0.3s,
			border-color 0.3s;
	}
	.lang:hover {
		color: var(--fg);
		border-color: var(--fg-3);
	}
	.bars {
		position: relative;
		width: 1.5rem;
		height: 0.6rem;
	}
	.bars i {
		position: absolute;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--fg);
		transition:
			transform 0.5s var(--ease-out),
			top 0.5s var(--ease-out);
	}
	.bars i:first-child {
		top: 0;
	}
	.bars i:last-child {
		top: calc(100% - 2px);
		left: 0.5rem;
	}
	.open .bars i:first-child {
		top: calc(50% - 1px);
		transform: rotate(45deg);
	}
	.open .bars i:last-child {
		top: calc(50% - 1px);
		left: 0;
		transform: rotate(-45deg);
	}

	/* Mobile menu */
	.sheet {
		position: fixed;
		inset: 0;
		z-index: 55;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: calc(var(--nav-h) + env(safe-area-inset-top, 0px) + 1.5rem) var(--gutter)
			calc(2rem + env(safe-area-inset-bottom, 0px));
		background: var(--bg);
		clip-path: inset(0 0 100% 0);
		transition: clip-path 0.7s var(--ease-io);
	}
	.sheet.open {
		clip-path: inset(0);
	}
	.sheet nav {
		display: flex;
		flex-direction: column;
	}
	.sheet nav a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-block: 0.85rem;
		border-bottom: 1px solid var(--hair);
		font-size: clamp(2rem, 9vw, 3rem);
		font-weight: 800;
		font-stretch: 125%;
		letter-spacing: -0.03em;
		line-height: 1;
		text-transform: uppercase;
		opacity: 0;
		transform: translateY(1.5rem);
		transition:
			opacity 0.6s var(--ease-out),
			transform 0.8s var(--ease-out);
	}
	.sheet.open nav a {
		opacity: 1;
		transform: none;
		transition-delay: calc(0.2s + var(--i) * 50ms);
	}
	.sheet nav a :global(svg) {
		width: 1.4rem;
		color: var(--lime);
	}
	.sheet-foot {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.9375rem;
		color: var(--fg-2);
	}

	@media (min-width: 1000px) {
		.brand {
			width: 11.5rem;
		}
		.desk {
			display: flex;
			gap: 0.25rem;
			margin-left: auto;
		}
		.desk a {
			position: relative;
			padding: 0.5rem 0.85rem;
			font-size: 0.875rem;
			font-weight: 500;
			color: var(--fg-2);
			transition: color 0.3s;
		}
		.desk a::after {
			content: '';
			position: absolute;
			left: 0.85rem;
			right: 0.85rem;
			bottom: 0.2rem;
			height: 2px;
			background: var(--lime);
			transform: scaleX(0);
			transform-origin: right;
			transition: transform 0.5s var(--ease-out);
		}
		.desk a:hover,
		.desk a.current {
			color: var(--fg);
		}
		.desk a.current::after {
			transform: scaleX(1);
			transform-origin: left;
		}
		.cta {
			display: inline-flex;
		}
		.lang {
			margin-left: -1rem;
		}
		.menu-btn,
		.sheet {
			display: none;
		}
	}
</style>
