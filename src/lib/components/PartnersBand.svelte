<script lang="ts">
	import Arrow from './Arrow.svelte';
	import PartnerLogos from './PartnerLogos.svelte';
	import type { Partner, Settings } from '#lib/content.ts';
	import { useI18n, pagePath } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	// Partnerships on the home page: the pitch and the logos, with the positions
	// on the kart a click away on the partnerships page.

	let { settings, partners, karts, index }: { settings: Settings; partners: Partner[]; karts: number; index: string } =
		$props();

	const i18n = useI18n();
	const t = $derived(i18n.t.partners);
	const title = $derived(i18n.lines('partners.title'));
</script>

<section id="partners" class="band" data-sector>
	<div class="wrap">
		<div class="pitch" use:inview>
			<div>
				<p class="eyebrow rv"><b>{index}</b> · {i18n.text('partners.eyebrow')}</p>
				<h2 class="display">
					{#each title as line, i}
						<span class="line"><span class:accent={i === title.length - 1} style:--d="{60 + i * 90}ms">{line}</span></span>
					{/each}
				</h2>
			</div>
			<div class="side rv" style:--d="220ms">
				<p>{i18n.text('partners.intro')} {t.positions(karts)}</p>
				<a class="btn" href={pagePath('partners', i18n.lang)}>{t.more} <Arrow /></a>
			</div>
		</div>

		{#if partners.length}
			<div class="ours" use:inview>
				<p class="eyebrow rv">{t.ours}</p>
				<PartnerLogos {partners} />
			</div>
		{/if}
	</div>
</section>

<style>
	.band {
		padding-block: var(--section);
		background: var(--bg-1);
		border-top: 1px solid var(--hair);
	}
	.pitch {
		display: grid;
		gap: 2rem;
		align-items: end;
	}
	h2 {
		margin-top: 1.6rem;
		font-size: var(--t-section);
	}
	.side {
		display: grid;
		justify-items: start;
		gap: 1.75rem;
		max-width: 30rem;
	}
	.side p {
		font-size: 1.0625rem;
		color: var(--fg-2);
		text-wrap: pretty;
	}
	.ours {
		margin-top: clamp(3rem, 6vw, 4.5rem);
	}

	@media (min-width: 960px) {
		.pitch {
			grid-template-columns: minmax(0, 1fr) minmax(0, 28rem);
			gap: 4rem;
		}
	}
</style>
