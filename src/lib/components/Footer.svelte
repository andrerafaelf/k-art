<script lang="ts">
	import Logo from './Logo.svelte';
	import Arrow from './Arrow.svelte';
	import CalendarLinks from './CalendarLinks.svelte';
	import type { Settings } from '#lib/content.ts';
	import { useI18n, localize } from '#lib/i18n.ts';

	let { settings, links }: { settings: Settings; links: { href: string; label: string }[] } = $props();

	const i18n = useI18n();
	const year = new Date().getFullYear();
</script>

<footer>
	<div class="wrap">
		<div class="top">
			<a href={localize('/', i18n.lang)} aria-label={i18n.t.nav.home}><Logo class="flogo" /></a>
			<div class="side">
				<nav aria-label="Footer">
					{#each links as l}
						<a class="ulink" href={l.href}>{l.label}</a>
					{/each}
				</nav>
				<CalendarLinks label={i18n.t.calendar.short} />
			</div>
		</div>
		<div class="bottom">
			<span>© {year} K'ART Racing Team</span>
			<span>{settings.location}</span>
			<!-- noopener only, so the visit still shows up as a referral from this site -->
			<span class="credit">
				{i18n.t.footer.credit}
				<a class="ulink" href="https://andrerfferreira.work/" target="_blank" rel="noopener">André Ferreira</a>
			</span>
			<a href="#top" class="totop">{i18n.t.footer.top} <Arrow dir="up" /></a>
		</div>
	</div>
</footer>

<style>
	footer {
		padding-block: clamp(3.5rem, 7vw, 5.5rem) calc(2rem + env(safe-area-inset-bottom, 0px));
		font-size: 0.875rem;
		color: var(--fg-2);
	}
	.top {
		display: grid;
		gap: 2.5rem;
		padding-bottom: clamp(3rem, 6vw, 5rem);
	}
	footer :global(.flogo) {
		width: min(100%, 22rem);
		color: var(--fg);
	}
	.side {
		display: grid;
		gap: 2.5rem;
	}
	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 2rem;
		color: var(--fg);
		font-weight: 500;
	}
	.bottom {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--hair);
	}
	/* Last line on its own on phones, in line with the rest on wide screens */
	.credit {
		order: 1;
		flex-basis: 100%;
		color: var(--fg-3);
	}
	.credit a {
		color: var(--fg-2);
		transition: color 0.3s;
	}
	.credit a:hover {
		color: var(--fg);
	}
	.totop {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-left: auto;
		color: var(--fg);
	}
	.totop :global(svg) {
		width: 0.8rem;
		transition: translate 0.4s var(--ease-out);
	}
	.totop:hover :global(svg) {
		translate: 0 -3px;
	}

	@media (min-width: 900px) {
		.top {
			grid-template-columns: 1fr auto;
			align-items: end;
		}
		.credit {
			order: 0;
			flex-basis: auto;
		}
	}
</style>
