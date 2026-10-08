<script lang="ts">
	import Arrow from './Arrow.svelte';
	import ContactForm from './ContactForm.svelte';
	import { tr, type Settings } from '#lib/content.ts';
	import type { ContactResult } from '#lib/contact.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	let { settings, result, index }: { settings: Settings; result?: ContactResult; index: string } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.contact);
	// The address may only break after the @, never at the hyphen in the domain
	const address = $derived(settings.email.split(/(?<=@)/));
</script>

<section id="contact" class="contact">
	<div class="wrap" use:inview>
		<p class="eyebrow rv"><b>{index}</b> · {t.eyebrow}</p>
		<h2 class="display">
			{#each t.title as line, i}
				<span class="line"><span style:--d="{80 + i * 90}ms">{line}</span></span>
			{/each}
		</h2>

		<div class="grid">
			<div class="rv" style:--d="260ms">
				<ContactForm {result} email={settings.email} />
			</div>

			<aside class="side">
				<div class="rv" style:--d="320ms">
					<h3>{t.direct}</h3>
					<a class="mail" href="mailto:{settings.email}">
						<span class="addr" style:--chars={settings.email.length}
							>{#each address as part, i}{#if i}<wbr />{/if}<span>{part}</span>{/each}</span
						>
						<span class="ico"><Arrow dir="out" /></span>
					</a>
				</div>
				<div class="rv" style:--d="380ms">
					<h3>{t.drivers}</h3>
					<p>{tr(settings.tryouts, i18n.lang)}</p>
				</div>
				<div class="rv" style:--d="440ms">
					<h3>{t.press}</h3>
					<p>{tr(settings.press, i18n.lang)}</p>
				</div>
				<div class="rv" style:--d="500ms">
					<h3>{t.follow}</h3>
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
	.contact {
		--fg: var(--black);
		--fg-2: rgb(10 10 11 / 0.7);
		padding-block: var(--section) clamp(4rem, 8vw, 6rem);
		background: var(--lime);
		color: var(--black);
	}
	.contact :focus-visible {
		outline-color: var(--black);
	}
	.contact ::selection {
		background: var(--black);
		color: var(--lime);
	}
	.eyebrow {
		color: var(--fg-2);
	}
	.eyebrow::before {
		background: var(--black);
	}
	.eyebrow b {
		color: var(--black);
	}
	h2 {
		margin-top: 1.75rem;
		font-size: clamp(3rem, 8vw, 7.5rem);
	}

	.grid {
		display: grid;
		gap: clamp(3.5rem, 7vw, 6rem);
		margin-top: clamp(2.5rem, 6vw, 5rem);
	}

	.side > div {
		padding-block: 1.15rem 1.5rem;
		border-top: 1px solid rgb(10 10 11 / 0.25);
	}
	.side > div:first-child {
		border-top: 2px solid var(--black);
	}
	h3 {
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
