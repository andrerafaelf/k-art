<script lang="ts">
	import SectionHead from './SectionHead.svelte';
	import Arrow from './Arrow.svelte';
	import { tr, type Partner, type Settings } from '#lib/content.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	let { settings, partners, karts }: { settings: Settings; partners: Partner[]; karts: number } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.partners);

</script>

<section id="partners" class="partners">
	<div class="wrap">
		{#if partners.length}
			<div class="ours" use:inview>
				<p class="eyebrow rv">{t.ours}</p>
				<ul class="logos">
					{#each partners as p, i (p.id)}
						<li class="rv {p.tone}" style:--d="{i * 60}ms">
							{#if p.url}
								<a href={p.url} target="_blank" rel="noreferrer" title={p.name}>
									<img src={p.logo} alt={p.name} loading="lazy" />
								</a>
							{:else}
								<img src={p.logo} alt={p.name} loading="lazy" />
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<SectionHead index="S7" eyebrow={t.eyebrow} lines={t.title} accent={1}>
			<p>{tr(settings.partnersIntro, i18n.lang)} {t.positions(karts)}</p>
		</SectionHead>

		<!-- The four positions on the kart, ranked like a results chart: P1 is the title partner -->
		<ol class="ladder" use:inview>
			{#each settings.packages as p, i (p.zone)}
				<li class="step rv" class:p1={i === 0} style:--i={i} style:--d="{i * 90}ms">
					<span class="pos num">P{i + 1}</span>
					<span class="tier">{tr(p.tier, i18n.lang)}</span>
					<h3>{tr(p.title, i18n.lang)}</h3>
					<p>{tr(p.body, i18n.lang)}</p>
				</li>
			{/each}
		</ol>

		<div class="cta" use:inview>
			<a class="btn rv" href="mailto:{settings.email}?subject={encodeURIComponent(t.subject)}">
				{t.deck} <Arrow />
			</a>
		</div>
	</div>
</section>

<style>
	.partners {
		padding-block: var(--section);
		background: var(--bg-1);
		border-top: 1px solid var(--hair);
	}

	/* Current partners */
	.ours {
		margin-bottom: clamp(5rem, 10vw, 9rem);
	}
	.logos {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
		gap: 1px;
		margin: 1.75rem 0 0;
		padding: 0;
		list-style: none;
		background: var(--hair);
		border: 1px solid var(--hair);
	}
	.logos li {
		display: grid;
		place-items: center;
		aspect-ratio: 16 / 9;
		padding: 1.5rem 1.75rem;
		background: var(--bg-1);
	}
	.logos li.light {
		background: #efeee9;
	}
	.logos a {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
	}
	.logos img {
		max-width: 100%;
		max-height: 3.25rem;
		object-fit: contain;
		opacity: 0.85;
		transition:
			opacity 0.3s,
			scale 0.5s var(--ease-out);
	}
	.logos li:hover img {
		opacity: 1;
		scale: 1.04;
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
		font-size: clamp(1.5rem, 2.2vw, 2rem);
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
