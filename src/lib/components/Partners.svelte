<script lang="ts">
	import SectionHead from './SectionHead.svelte';
	import Arrow from './Arrow.svelte';
	import PartnerLogos from './PartnerLogos.svelte';
	import { ZONES, type Partner, type Settings } from '#lib/content.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	// The partnerships page: the pitch, the four positions on the kart, then the partners we have

	let { settings, partners, karts }: { settings: Settings; partners: Partner[]; karts: number } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.partners);
	// The four positions on the kart, from the title partner down
	const packages = $derived(
		ZONES.map((zone) => ({
			zone,
			title: i18n.text(`partners.${zone}.title`),
			tier: i18n.text(`partners.${zone}.tier`),
			body: i18n.text(`partners.${zone}.body`)
		}))
	);
</script>

<section id="partners" class="partners">
	<div class="wrap">
		<SectionHead level={1} eyebrow={i18n.text('partners.eyebrow')} lines={i18n.lines('partners.title')} accent={-1}>
			<p>{i18n.text('partners.intro')} {t.positions(karts)}</p>
		</SectionHead>

		<!-- The four positions on the kart, ranked like a results chart: P1 is the title partner -->
		<ol class="ladder" use:inview>
			{#each packages as p, i (p.zone)}
				<li class="step rv" class:p1={i === 0} style:--i={i} style:--d="{i * 90}ms">
					<span class="pos num">P{i + 1}</span>
					<span class="tier">{p.tier}</span>
					<h3>{p.title}</h3>
					<p>{p.body}</p>
				</li>
			{/each}
		</ol>

		<div class="cta" use:inview>
			<a class="btn rv" href="mailto:{settings.email}?subject={encodeURIComponent(t.subject)}">
				{t.deck} <Arrow />
			</a>
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
	.partners {
		padding-block: var(--page-top) var(--section);
	}

	/* Current partners */
	.ours {
		margin-top: clamp(4rem, 8vw, 7rem);
	}

	/* ---------- positions ---------- */
	.ladder {
		display: grid;
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.step {
		position: relative;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding: 1.5rem 1.5rem 1.75rem;
		background: var(--bg-2);
		box-shadow: inset 0 0 0 1px var(--hair-2);
		transition: box-shadow 0.4s;
	}
	.step:hover {
		box-shadow: inset 0 0 0 1px rgb(214 249 6 / 0.5);
	}
	/* Outlined position number filling the corner */
	.step::after {
		content: 'P' counter(pos);
		counter-increment: pos;
		position: absolute;
		z-index: -1;
		right: -0.04em;
		bottom: -0.22em;
		font-size: 9rem;
		font-style: italic;
		font-stretch: 70%;
		font-weight: 900;
		line-height: 1;
		color: transparent;
		-webkit-text-stroke: 1.5px rgb(255 255 255 / 0.07);
	}
	.ladder {
		counter-reset: pos;
	}
	.pos {
		align-self: flex-start;
		display: grid;
		place-items: center;
		min-width: 3.1rem;
		height: 2.3rem;
		padding-inline: 0.5rem;
		background: var(--fg);
		color: var(--black);
		font-size: 1.5rem;
		clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
	}
	.tier {
		margin-top: 1.5rem;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	h3 {
		margin-top: 0.5rem;
		font-size: var(--t-card);
		font-style: italic;
		font-stretch: 125%;
		font-weight: 900;
		letter-spacing: -0.03em;
		line-height: 1;
		text-transform: uppercase;
	}
	.step p {
		margin-top: 0.85rem;
		max-width: 22rem;
		font-size: 0.9375rem;
		color: var(--fg-2);
	}

	/* Title partner, in lime */
	.p1 {
		background: linear-gradient(160deg, #e4ff3a, var(--lime) 55%, #b8d600);
		box-shadow: none;
		color: var(--black);
	}
	.p1:hover {
		box-shadow: none;
	}
	.p1::after {
		-webkit-text-stroke-color: rgb(0 0 0 / 0.14);
	}
	.p1 .pos {
		background: var(--black);
		color: var(--lime);
	}
	.p1 .tier,
	.p1 p {
		color: rgb(10 10 11 / 0.7);
	}

	.cta {
		margin-top: 2rem;
	}

	@media (min-width: 700px) {
		.ladder {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	/* Desktop: steps that drop in height from P1 to P4, standing on one line */
	@media (min-width: 1100px) {
		.ladder {
			grid-template-columns: repeat(4, minmax(0, 1fr));
			align-items: end;
		}
		.step {
			min-height: calc(30rem - var(--i) * 3.5rem);
		}
		.step p {
			margin-bottom: auto;
		}
	}
</style>
