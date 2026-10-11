<script lang="ts">
	import Arrow from './Arrow.svelte';
	import type { Settings } from '#lib/content.ts';
	import { useI18n, pagePath } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	// The last stop on the home page, in lime: a way to the contact page and the address

	let { settings, index }: { settings: Settings; index: string } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.contact);
</script>

<section id="contact" class="band" data-sector>
	<div class="wrap" use:inview>
		<div>
			<p class="eyebrow rv"><b>{index}</b> · {i18n.text('contact.eyebrow')}</p>
			<h2 class="display">
				{#each i18n.lines('contact.title') as line, i}
					<span class="line"><span style:--d="{80 + i * 90}ms">{line}</span></span>
				{/each}
			</h2>
		</div>
		<div class="side rv" style:--d="240ms">
			<p>{i18n.text('contact.lead')}</p>
			<div class="actions">
				<a class="btn" href={pagePath('contact', i18n.lang)}>{i18n.t.nav.cta} <Arrow /></a>
				<a class="ulink mail" href="mailto:{settings.email}">{settings.email}</a>
			</div>
		</div>
	</div>
</section>

<style>
	.band {
		--fg: var(--black);
		--fg-2: rgb(10 10 11 / 0.7);
		padding-block: clamp(4rem, 8vw, 7rem);
		background: var(--lime);
		color: var(--black);
	}
	.band :focus-visible {
		outline-color: var(--black);
	}
	.band ::selection {
		background: var(--black);
		color: var(--lime);
	}
	.wrap {
		display: grid;
		gap: 2.5rem;
		align-items: end;
	}
	.eyebrow::before {
		background: var(--black);
	}
	.eyebrow b {
		color: var(--black);
	}
	h2 {
		margin-top: 1.6rem;
		font-size: var(--t-page);
	}
	.side {
		display: grid;
		gap: 1.75rem;
		max-width: 30rem;
	}
	.side p {
		font-size: 1.125rem;
		color: var(--fg-2);
		text-wrap: pretty;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem 1.75rem;
	}
	.btn {
		--b: var(--black);
		--c: var(--lime);
		--h: #fff;
	}
	.btn:hover {
		--c: var(--black);
	}
	.mail {
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	@media (min-width: 960px) {
		.wrap {
			grid-template-columns: minmax(0, 1fr) minmax(0, 28rem);
			gap: 4rem;
		}
	}
</style>
