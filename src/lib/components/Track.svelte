<script lang="ts">
	import { VIEW, LAP, CLOCKWISE, COORDS, RACER } from '#lib/faial.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { inview } from '#lib/motion.ts';

	const i18n = useI18n();
	const t = $derived(i18n.t.madeira.track);

	// The official lap length, set by hand. It lives here rather than in faial.ts so that
	// regenerating the map can never overwrite it with a length measured off the drawing.
	const LAP_LENGTH = 1040;

	const [vx, vy, vw, vh] = VIEW;
	// Scale bar and north arrow go in the two empty corners of the drawing
	const SCALE = { x: vx + vw - 66, y: vy + vh - 12 };
	const coords = `${COORDS.lat.toFixed(3)}° N, ${Math.abs(COORDS.lon).toFixed(3)}° W`;

	// The racer leads and its trail follows a few hundredths of a second behind,
	// so the trail stretches on the straights and bunches up under braking.
	// Tail first, so the head is drawn on top.
	const TRAIL = 12;
	const GAP = 0.045;
	const dots = Array.from({ length: TRAIL + 1 }, (_, i) => {
		const k = TRAIL - i;
		return {
			lag: k * GAP,
			r: k === 0 ? 3.4 : 2.8 * (1 - k / (TRAIL + 3)),
			o: k === 0 ? 1 : 0.7 * (1 - k / (TRAIL + 1)),
			head: k === 0
		};
	});

	// Timeline once the plan is well in view: the asphalt fades in, the racing
	// line draws one lap (see the CSS), and when it closes the racer appears on
	// the line, waits a moment and pulls away.
	const LINE_CLOSES = 2700;
	const HOLD = 0.35;
	/** How long the standing start takes to reach racing speed, in seconds */
	const RAMP = 0.6;

	const KEY_POINTS = RACER.keyPoints.split(';').map(Number);
	const KEY_TIMES = RACER.keyTimes.split(';').map(Number);

	/** Share of the lap covered t seconds into it, read off the simulated speed trace */
	function covered(t: number) {
		const u = (t / RACER.dur) % 1;
		let lo = 0;
		let hi = KEY_TIMES.length - 1;
		while (hi - lo > 1) {
			const mid = (lo + hi) >> 1;
			if (KEY_TIMES[mid] <= u) lo = mid;
			else hi = mid;
		}
		return KEY_POINTS[lo] + ((KEY_POINTS[hi] - KEY_POINTS[lo]) * (u - KEY_TIMES[lo])) / (KEY_TIMES[hi] - KEY_TIMES[lo]);
	}

	/** Racing time from a standing start, so the kart pulls away from rest instead of leaving at full speed */
	const launch = (t: number) => (t <= 0 ? 0 : t - RAMP * (1 - Math.exp(-t / RAMP)));

	let plan: HTMLElement | undefined = $state();
	let lap: SVGPathElement | undefined = $state();
	const circles: SVGCircleElement[] = [];

	let armed = $state(false);
	let go = $state(false);
	let racing = $state(false);

	$effect(() => {
		// With reduced motion the plan just shows, and the racer stays hidden (see the CSS)
		if (!plan || !lap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		armed = true;

		// The lap measured once, so each frame is a lookup
		const STEPS = 1000;
		const length = lap.getTotalLength();
		const xy = new Float32Array((STEPS + 1) * 2);
		for (let i = 0; i <= STEPS; i++) {
			const p = lap.getPointAtLength((length * i) / STEPS);
			xy[i * 2] = p.x;
			xy[i * 2 + 1] = p.y;
		}

		let clock = -HOLD;
		let onscreen = false;
		let frame = 0;
		let last = 0;
		let timer = 0;

		// Each dot runs the same lap, lag seconds behind the head; until its time comes it waits on the line
		const place = () => {
			dots.forEach((dot, i) => {
				const f = covered(launch(clock - dot.lag)) * STEPS;
				const j = Math.min(Math.floor(f), STEPS - 1);
				const r = f - j;
				circles[i].setAttribute('cx', (xy[j * 2] + (xy[j * 2 + 2] - xy[j * 2]) * r).toFixed(2));
				circles[i].setAttribute('cy', (xy[j * 2 + 1] + (xy[j * 2 + 3] - xy[j * 2 + 1]) * r).toFixed(2));
			});
		};
		const tick = (now: number) => {
			// Capped, so coming back to a background tab carries on instead of jumping
			clock += Math.min(now - last, 100) / 1000;
			last = now;
			place();
			frame = requestAnimationFrame(tick);
		};
		const run = () => {
			if (frame || !racing || !onscreen) return;
			last = performance.now();
			frame = requestAnimationFrame(tick);
		};
		const pause = () => {
			cancelAnimationFrame(frame);
			frame = 0;
		};

		place();
		const io = new IntersectionObserver(
			([entry]) => {
				onscreen = entry.isIntersecting;
				if (!go && entry.intersectionRatio >= 0.4) {
					go = true;
					timer = window.setTimeout(() => {
						racing = true;
						run();
					}, LINE_CLOSES);
				}
				if (onscreen) run();
				else pause();
			},
			{ threshold: [0, 0.4] }
		);
		io.observe(plan);

		return () => {
			io.disconnect();
			pause();
			clearTimeout(timer);
		};
	});
</script>

<div class="track striped" use:inview>
	<div class="info">
		<p class="eyebrow rv">{t.eyebrow}</p>
		<h3 class="rv" style:--d="80ms">Kartódromo do Faial</h3>
		<p class="place rv" style:--d="140ms">{t.place}</p>

		<dl class="rv" style:--d="200ms">
			<div><dt>{t.length}</dt><dd class="mono">{LAP_LENGTH} m</dd></div>
			<div><dt>{t.direction}</dt><dd>{CLOCKWISE ? t.clockwise : t.anticlockwise}</dd></div>
			<div class="wide"><dt>{t.coords}</dt><dd class="mono">{coords}</dd></div>
		</dl>
	</div>

	<figure class="plan" bind:this={plan} class:armed class:go class:racing>
		<svg viewBox={VIEW.join(' ')} role="img" aria-label={t.alt}>
			<path d={LAP} class="asphalt" bind:this={lap} />
			<path d={LAP} class="edge" />
			<path d={LAP} class="line" pathLength="1" />

			<g class="racer">
				{#each dots as dot, i}
					<circle bind:this={circles[i]} r={dot.r} opacity={dot.o} class:head={dot.head} />
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
		font-size: var(--t-section);
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
	/* Hidden only once the script has taken over, so without it the plan simply shows.
	   The transitions sit on .go so arming hides everything at once. */
	.armed .asphalt,
	.armed .edge {
		opacity: 0;
	}
	.armed .line {
		stroke-dashoffset: 1.02;
	}
	.armed.go .asphalt,
	.armed.go .edge {
		opacity: 1;
		transition: opacity 0.9s var(--ease-out);
	}
	/* Closes the lap at 2.7s, when the racer appears (LINE_CLOSES) */
	.armed.go .line {
		stroke-dashoffset: 0;
		transition: stroke-dashoffset 2.2s var(--ease-io) 0.5s;
	}
	.racer {
		opacity: 0;
		transition: opacity 0.4s;
	}
	.racing .racer {
		opacity: 1;
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
