<script lang="ts">
	import { VIEW, LAP, LAP_LENGTH, CLOCKWISE, COORDS, RACER } from '#lib/faial.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	const i18n = useI18n();
	const t = $derived(i18n.t.madeira.track);

	const [vx, vy, vw, vh] = VIEW;
	// Scale bar and north arrow go in the two empty corners of the drawing
	const SCALE = { x: vx + vw - 66, y: vy + vh - 12 };
	const coords = `${COORDS.lat.toFixed(3)}° N, ${Math.abs(COORDS.lon).toFixed(3)}° W`;

	// The racer leads and its trail follows a few hundredths of a second behind,
	// so the trail stretches on the straights and bunches up under braking
	const TRAIL = 12;
	const GAP = 0.045;
	const dots = Array.from({ length: TRAIL + 1 }, (_, k) => ({
		begin: `-${((TRAIL - k) * GAP + 0.001).toFixed(3)}s`,
		r: k === 0 ? 3.4 : 2.8 * (1 - k / (TRAIL + 3)),
		o: k === 0 ? 1 : 0.7 * (1 - k / (TRAIL + 1))
	}));
</script>

<div class="track striped" use:inview>
	<div class="info">
		<p class="eyebrow rv">{t.eyebrow}</p>
		<h3 class="rv" style:--d="80ms">Kartódromo do Faial</h3>
		<p class="place rv" style:--d="140ms">{t.place}</p>

		<dl class="rv" style:--d="200ms">
			<div><dt>{t.length}</dt><dd class="mono">≈ {LAP_LENGTH} m</dd></div>
			<div><dt>{t.direction}</dt><dd>{CLOCKWISE ? t.clockwise : t.anticlockwise}</dd></div>
			<div class="wide"><dt>{t.coords}</dt><dd class="mono">{coords}</dd></div>
		</dl>
	</div>

	<figure class="plan">
		<svg viewBox={VIEW.join(' ')} role="img" aria-label={t.alt}>
			<path id="faial-lap" d={LAP} class="asphalt" />
			<path d={LAP} class="edge" />
			<path d={LAP} class="line" pathLength="1" />

			<!-- Racer, drawn last-first so the head sits on top of its trail -->
			<g class="racer">
				{#each [...dots].reverse() as dot, k}
					<circle r={dot.r} opacity={dot.o} class:head={k === dots.length - 1}>
						<animateMotion
							dur="{RACER.dur}s"
							begin={dot.begin}
							repeatCount="indefinite"
							calcMode="linear"
							keyPoints={RACER.keyPoints}
							keyTimes={RACER.keyTimes}
						>
							<mpath href="#faial-lap" />
						</animateMotion>
					</circle>
				{/each}
			</g>

			<g class="scale" transform="translate({SCALE.x} {SCALE.y})">
				<path d="M0 -3V0H50V-3" />
				<text x="25" y="-6">50 m</text>
			</g>
			<g class="north" transform="translate({vx + 16} {vy + 18})">
				<path d="M0 -10L4 2H-4Z" />
				<text y="14">N</text>
			</g>
		</svg>
	</figure>
</div>

<style>
	.track {
		display: grid;
		gap: 2rem;
		margin-top: clamp(4rem, 8vw, 6.5rem);
		padding: clamp(1.5rem, 3vw, 2.5rem);
		background:
			radial-gradient(70% 90% at 75% 50%, rgb(214 249 6 / 0.06), transparent 70%),
			var(--bg-1);
		box-shadow: inset 0 0 0 1px var(--hair-2);
	}

	h3 {
		margin-top: 1.25rem;
		font-size: clamp(2rem, 4vw, 3.5rem);
		font-style: italic;
		font-stretch: 125%;
		font-weight: 900;
		letter-spacing: -0.035em;
		line-height: 0.95;
		text-transform: uppercase;
		text-wrap: balance;
	}
	.place {
		margin-top: 0.85rem;
		max-width: 26rem;
		color: var(--fg-2);
	}
	dl {
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin: 1.75rem 0 0;
		border-top: 1px solid var(--hair-2);
	}
	dl div {
		padding: 0.9rem 0;
		border-bottom: 1px solid var(--hair);
	}
	dl .wide {
		grid-column: 1 / -1;
	}
	dt {
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	dd {
		margin-top: 0.3rem;
		font-size: 1.15rem;
		font-weight: 600;
	}
	.plan svg {
		width: 100%;
		overflow: visible;
	}
	/* About 8 m of asphalt, the width of a kart track */
	.asphalt {
		fill: none;
		stroke: #262a31;
		stroke-width: 8;
		stroke-linejoin: round;
	}
	.edge {
		fill: none;
		stroke: rgb(255 255 255 / 0.12);
		stroke-width: 9.5;
		stroke-linejoin: round;
		mix-blend-mode: screen;
	}
	.line {
		fill: none;
		stroke: var(--lime);
		stroke-width: 1.6;
		stroke-linejoin: round;
		/* A dash slightly longer than the lap, so no seam shows where it closes */
		stroke-dasharray: 1.02 1.02;
		stroke-dashoffset: 0;
		filter: drop-shadow(0 0 3px rgb(214 249 6 / 0.7));
	}
	:global([data-inview]) .line {
		stroke-dashoffset: 1.02;
		transition: stroke-dashoffset 2.8s var(--ease-io) 0.3s;
	}
	:global([data-inview].is-in) .line {
		stroke-dashoffset: 0;
	}
	.racer circle {
		fill: #fff;
	}
	.racer .head {
		fill: #fff;
		filter: drop-shadow(0 0 3px var(--lime)) drop-shadow(0 0 7px var(--lime));
	}
	.scale path,
	.north path {
		fill: none;
		stroke: var(--fg-2);
		stroke-width: 1;
	}
	.north path {
		fill: var(--fg-2);
		stroke: none;
	}
	.scale text,
	.north text {
		font-family: var(--mono);
		font-size: 7px;
		text-anchor: middle;
		fill: var(--fg-2);
	}

	@media (min-width: 1000px) {
		.track {
			grid-template-columns: minmax(0, 4fr) minmax(0, 7fr);
			align-items: center;
			gap: 3rem;
		}
	}
	@media (max-width: 699px) {
		.scale text,
		.north text {
			font-size: 12px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.racer {
			display: none;
		}
	}
</style>
