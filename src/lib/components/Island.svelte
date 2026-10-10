<script lang="ts">
	import SectionHead from './SectionHead.svelte';
	import { inview } from '#lib/motion.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { BOX, COAST, CONTOURS, PLACES } from '#lib/madeira.ts';
	import Track from './Track.svelte';

	let { index }: { index?: string } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.madeira);

	// Real coastline and height contours, see lib/madeira.ts
	const [x0, y0, x1, y1] = BOX;
	const VIEW = { x: x0 - 30, y: y0 - 70, w: x1 - x0 + 170, h: y1 - y0 + 110 };
	const faial = { x: PLACES.faial[0], y: PLACES.faial[1] };
	const peak = { x: PLACES.peak[0], y: PLACES.peak[1] };
	const funchal = { x: PLACES.funchal[0], y: PLACES.funchal[1] };
	// Out to sea towards Lisbon, north-east
	const ROUTE = `M${faial.x} ${faial.y}C${faial.x + 60} ${faial.y - 50} ${x1 + 30} ${y0 - 30} ${x1 + 130} ${y0 - 62}`;
</script>

<section id="madeira" class="island">
	<div class="wrap">
		<SectionHead {index} eyebrow={t.eyebrow} lines={t.title} accent={1}>
			<p>{t.intro}</p>
		</SectionHead>

		<div class="layout">
			<figure class="map" use:inview>
				<svg viewBox="{VIEW.x} {VIEW.y} {VIEW.w} {VIEW.h}" role="img" aria-label={t.map}>
					<defs>
						<clipPath id="madeira-land"><path d={COAST} /></clipPath>
					</defs>
					<path d={COAST} class="land" />
					<g class="contours" clip-path="url(#madeira-land)">
						{#each CONTOURS as c, i}
							<path d={c.d} pathLength="1" class:hi={i >= CONTOURS.length - 3} style:--i={i} />
						{/each}
					</g>
					<path d={COAST} class="coast" pathLength="1" />

					<path class="route" d={ROUTE} pathLength="1" />
					<text x={x1 + 126} y={y0 - 40} text-anchor="end" class="route-label">{t.route}</text>

					<g transform="translate({peak.x} {peak.y})" class="pin">
						<path d="M0 -6L6 4H-6Z" class="peak" />
						<text x="-12" y="22" text-anchor="end">Pico Ruivo</text>
						<text x="-12" y="37" text-anchor="end" class="sub">{t.peak}</text>
					</g>
					<g transform="translate({funchal.x} {funchal.y})" class="pin minor">
						<circle r="3.5" class="town" />
						<text x="10" y="18">Funchal</text>
					</g>
					<g transform="translate({faial.x} {faial.y})" class="pin">
						<circle r="14" class="halo" />
						<circle r="5" class="dot" />
						<text x="-6" y="-26" text-anchor="end">Faial</text>
						<text x="-6" y="-11" text-anchor="end" class="sub">{t.workshop}</text>
					</g>
				</svg>
			</figure>

			<dl class="facts" use:inview>
				{#each t.facts as f, i}
					<div class="rv" style:--d="{i * 80}ms">
						<dt class="num">{f.v}<small>{f.u}</small></dt>
						<dd>{f.l}</dd>
					</div>
				{/each}
			</dl>
		</div>

		<Track />
	</div>
</section>

<style>
	.island {
		position: relative;
		padding-block: var(--section);
		overflow: hidden;
	}

	.layout {
		display: grid;
		gap: clamp(3rem, 6vw, 5rem);
	}

	.map {
		margin-inline: calc(var(--gutter) * -1);
	}
	svg {
		width: 100%;
		overflow: visible;
	}
	.land {
		fill: rgb(68 184 243 / 0.06);
	}
	.coast {
		fill: none;
		stroke: var(--blue);
		stroke-width: 1.6;
		stroke-linejoin: round;
		stroke-dasharray: 1.02 1.02;
	}
	.contours path {
		fill: none;
		stroke: rgb(68 184 243 / calc(0.22 + var(--i) * 0.05));
		stroke-width: 0.8;
		stroke-linejoin: round;
		stroke-dasharray: 1.02 1.02;
		stroke-dashoffset: 0;
	}
	.contours .hi {
		stroke: rgb(214 249 6 / 0.8);
	}
	:global([data-inview]) .contours path,
	:global([data-inview]) .coast {
		stroke-dashoffset: 1.02;
		transition: stroke-dashoffset 2.6s var(--ease-out);
		transition-delay: calc(var(--i, 0) * 70ms);
	}
	:global([data-inview].is-in) .contours path,
	:global([data-inview].is-in) .coast {
		stroke-dashoffset: 0;
	}

	.route {
		fill: none;
		stroke: var(--lime);
		stroke-width: 1.4;
		stroke-dasharray: 0.012 0.012;
	}
	.route-label,
	.pin text {
		font-family: var(--font);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		fill: var(--fg);
		paint-order: stroke;
		stroke: var(--bg);
		stroke-width: 6px;
		stroke-linejoin: round;
	}
	.route-label {
		fill: var(--lime);
	}
	.pin .sub {
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: none;
		fill: var(--fg-2);
	}
	.peak {
		fill: var(--fg);
	}
	.dot {
		fill: var(--lime);
	}
	.town {
		fill: var(--fg-2);
	}
	.minor text {
		font-weight: 500;
		fill: var(--fg-2);
	}
	.halo {
		fill: none;
		stroke: var(--lime);
		stroke-width: 1;
		opacity: 0.5;
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		border-top: 1px solid var(--hair-2);
	}
	.facts div {
		padding: 1.5rem 1.25rem 1.75rem 0;
		border-bottom: 1px solid var(--hair);
	}
	.facts div:nth-child(even) {
		padding-left: 1.25rem;
		border-left: 1px solid var(--hair);
	}
	dt {
		font-size: var(--t-figure);
	}
	dt small {
		margin-left: 0.2rem;
		font-size: 0.32em;
		font-stretch: 100%;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--lime);
	}
	dd {
		margin-top: 0.75rem;
		max-width: 17rem;
		font-size: 0.875rem;
		color: var(--fg-2);
	}

	@media (max-width: 699px) {
		.route-label,
		.pin text {
			font-size: 20px;
		}
		.pin .sub {
			display: none;
		}
	}

	@media (min-width: 1000px) {
		.layout {
			grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
			align-items: center;
		}
		.map {
			margin-inline: -4% 0;
		}
		.facts {
			grid-template-columns: 1fr;
		}
		.facts div,
		.facts div:nth-child(even) {
			display: grid;
			grid-template-columns: 13rem 1fr;
			gap: 1.5rem;
			align-items: center;
			padding: 1.35rem 0;
			border-left: 0;
		}
		dt {
			font-size: var(--t-figure);
		}
		dd {
			margin: 0;
		}
	}
</style>
