<script lang="ts">
	import Arrow from './Arrow.svelte';
	import ContactForm from './ContactForm.svelte';
	import { tr, type Settings } from '#lib/content.ts';
	import type { ContactResult } from '#lib/contact.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	// The contact page: the heading on the dark page, the form and the ways to reach us on lime

	let { settings, result }: { settings: Settings; result?: ContactResult } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.contact);
	// The address may only break after the @, never at the hyphen in the domain
	const address = $derived(settings.email.split(/(?<=@)/));
</script>

<section class="contact">
	<header class="wrap head" use:inview>
		<p class="eyebrow rv">{t.eyebrow}</p>
		<h1 class="display">
			{#each t.title as line, i}
				<span class="line"><span class:accent={i === 1} style:--d="{80 + i * 90}ms">{line}</span></span>
			{/each}
		</h1>
		<p class="lead rv" style:--d="240ms">{t.band}</p>
	</header>

	<!-- A form posted without JavaScript comes back here -->
	<div id="contact" class="panel">
		<div class="wrap grid" use:inview>
			<div class="rv" style:--d="260ms">
				<ContactForm {result} email={settings.email} />
			</div>

			<aside class="side">
				<div class="rv" style:--d="320ms">
					<h2>{t.direct}</h2>
					<a class="mail" href="mailto:{settings.email}">
						<span class="addr" style:--chars={settings.email.length}
							>{#each address as part, i}{#if i}<wbr />{/if}<span>{part}</span>{/each}</span
						>
						<span class="ico"><Arrow dir="out" /></span>
					</a>
				</div>
				<div class="rv" style:--d="380ms">
					<h2>{t.drivers}</h2>
					<p>{tr(settings.tryouts, i18n.lang)}</p>
				</div>
				<div class="rv" style:--d="440ms">
					<h2>{t.press}</h2>
					<p>{tr(settings.press, i18n.lang)}</p>
				</div>
				<div class="rv" style:--d="500ms">
					<h2>{t.follow}</h2>
					<p>
						<a class="ulink" href="https://instagram.com/{settings.instagram}" target="_blank" rel="noreferrer"
							>{t.instagram(settings.instagram)}</a
						>
					</p>
				</div>
			</aside>
		</div>
	</div>
</section>

<style>
	.head {
		padding-block: var(--page-top) clamp(3rem, 6vw, 5rem);
	}
	h1 {
		margin-top: 1.75rem;
		font-size: var(--t-page);
	}
	.lead {
		max-width: 32rem;
		margin-top: 1.75rem;
	}

	.panel {
		--fg: var(--black);
		--fg-2: rgb(10 10 11 / 0.7);
		padding-block: clamp(3rem, 6vw, 5rem) clamp(4rem, 8vw, 6rem);
		background: var(--lime);
		color: var(--black);
		scroll-margin-top: var(--nav-compact);
	}
	.panel :focus-visible {
		outline-color: var(--black);
	}
	.panel ::selection {
		background: var(--black);
		color: var(--lime);
	}

	.grid {
		display: grid;
		gap: clamp(3.5rem, 7vw, 6rem);
	}

	.side > div {
		padding-block: 1.15rem 1.5rem;
		border-top: 1px solid rgb(10 10 11 / 0.25);
	}
	.side > div:first-child {
		border-top: 2px solid var(--black);
	}
	.side h2 {
		padding-top: 0.4rem;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		line-height: 1.2;
		text-transform: uppercase;
	}
	.side p {
		margin-top: 0.6rem;
		max-width: 24rem;
		color: var(--fg-2);
	}
	.side p a {
		color: var(--black);
		font-weight: 600;
	}

	.mail {
		container-type: inline-size;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 0.75rem;
		font-weight: 800;
		font-stretch: 115%;
		letter-spacing: -0.03em;
		line-height: 1.05;
	}
	/* As large as fits on one line beside the icon, from the address length
	   (about 0.6em a character); below the smallest size it breaks after the @ */
	.addr {
		font-size: clamp(1.125rem, (100cqi - 4rem) / (var(--chars) * 0.62), 1.875rem);
	}
	.addr span {
		white-space: nowrap;
	}
	.ico {
		flex-shrink: 0;
		display: grid;
		place-items: center;
		width: 3rem;
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--black);
		color: var(--lime);
		transition: scale 0.5s var(--ease-out);
	}
	.ico :global(svg) {
		width: 36%;
		transition: rotate 0.5s var(--ease-out);
	}
	.mail:hover .ico {
		scale: 1.08;
	}
	.mail:hover .ico :global(svg) {
		rotate: 0deg;
	}

	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: minmax(0, 1.75fr) minmax(0, 1fr);
		}
	}
</style>
