<script lang="ts">
	import Arrow from './Arrow.svelte';
	import { tr, type Settings } from '#lib/content.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	let { settings, index }: { settings: Settings; index: string } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.contact);
</script>

<section id="contact" class="contact">
	<div class="wrap" use:inview>
		<p class="eyebrow rv"><b>{index}</b> · {t.eyebrow}</p>
		<h2 class="display">
			{#each t.title as line, i}
				<span class="line"><span style:--d="{80 + i * 90}ms">{line}</span></span>
			{/each}
		</h2>

		<a class="mail rv" style:--d="260ms" href="mailto:{settings.email}">
			<span>{settings.email}</span>
			<span class="ico"><Arrow dir="out" /></span>
		</a>

		<div class="cols">
			<div class="rv" style:--d="320ms">
				<h3>{t.drivers}</h3>
				<p>{tr(settings.tryouts, i18n.lang)}</p>
			</div>
			<div class="rv" style:--d="400ms">
				<h3>{t.press}</h3>
				<p>{tr(settings.press, i18n.lang)}</p>
			</div>
			<div class="rv" style:--d="480ms">
				<h3>{t.follow}</h3>
				<p>
					<a class="ulink" href="https://instagram.com/{settings.instagram}" target="_blank" rel="noreferrer"
						>{t.instagram(settings.instagram)}</a
					>
				</p>
			</div>
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
	.eyebrow {
		color: var(--fg-2);
	}
	.eyebrow::before {
		background: var(--black);
	}
	h2 {
		margin-top: 1.75rem;
		font-size: clamp(3.5rem, 13vw, 13rem);
	}

	.mail {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		margin-top: clamp(2.5rem, 6vw, 5rem);
		padding-block: 1.5rem;
		border-block: 2px solid var(--black);
		font-size: clamp(1.5rem, 4.6vw, 4.25rem);
		font-weight: 800;
		font-stretch: 115%;
		letter-spacing: -0.035em;
		line-height: 1;
		overflow-wrap: anywhere;
	}
	.ico {
		flex-shrink: 0;
		display: grid;
		place-items: center;
		width: clamp(3rem, 6vw, 5rem);
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

	.cols {
		display: grid;
		gap: 2rem;
		margin-top: clamp(2.5rem, 5vw, 4rem);
	}
	h3 {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.cols p {
		margin-top: 0.75rem;
		max-width: 22rem;
		color: var(--fg-2);
	}
	.cols a {
		color: var(--black);
		font-weight: 600;
	}

	@media (min-width: 900px) {
		.cols {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
