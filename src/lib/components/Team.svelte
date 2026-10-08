<script lang="ts">
	import { inview, countup } from '#lib/motion.ts';
	import { teamRecord, seasonSummary, type Pilot, type Round } from '#lib/content.ts';
	import { useI18n } from '#lib/i18n.ts';

	let { pilots, season, year, index }: { pilots: Pilot[]; season: Round[]; year: number; index: string } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.team);

	const stats = $derived.by(() => {
		const record = teamRecord(pilots);
		const summary = seasonSummary(season);
		return [
			{ value: record.wins, label: t.wins, note: t.winsNote },
			{ value: record.podiums, label: t.podiums, note: t.podiumsNote(record.starts) },
			{ value: record.poles, label: t.poles, note: t.polesNote },
			{
				value: summary.podiumRounds,
				of: summary.raced,
				label: t.seasonPodiums(year),
				note: summary.raced && summary.podiumRounds === summary.raced ? t.seasonAll : t.seasonSome
			}
		];
	});
</script>

<section id="team" class="team">
	<div class="wrap">
		<div class="intro" use:inview>
			<p class="eyebrow rv"><b>{index}</b> · {t.eyebrow}</p>
			<p class="statement rv" style:--d="100ms">
				{t.statement}
				<span>{t.statementMuted}</span>
			</p>
		</div>

		<dl class="stats" use:inview>
			{#each stats as s, i}
				<div class="stat rv" style:--d="{i * 90}ms">
					<dt>{s.label}</dt>
					<dd class="num">
						<span use:countup={s.value}>{s.value}</span>{#if s.of !== undefined}<span class="of"
								>/{s.of}</span
							>{/if}
					</dd>
					<p>{s.note}</p>
				</div>
			{/each}
		</dl>

		<div class="pillars" use:inview>
			{#each t.pillars as p, i}
				<article class="rv" style:--d="{i * 90}ms">
					<span class="idx num">0{i + 1}</span>
					<h3>{p.title}</h3>
					<p>{p.body}</p>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.team {
		padding-block: var(--section);
	}

	.intro {
		display: grid;
		gap: 2rem;
	}
	.statement {
		max-width: 21em;
		font-size: clamp(1.85rem, 3.9vw, 3.9rem);
		font-weight: 600;
		font-stretch: 108%;
		line-height: 1.08;
		letter-spacing: -0.03em;
		text-wrap: balance;
	}
	.statement span {
		color: var(--fg-3);
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		margin-top: clamp(4rem, 9vw, 8rem);
		border-top: 1px solid var(--hair-2);
	}
	.stat {
		display: flex;
		flex-direction: column;
		padding: 1.5rem 1.25rem 2rem 0;
		border-bottom: 1px solid var(--hair);
	}
	.stat:nth-child(even) {
		padding-left: 1.25rem;
		border-left: 1px solid var(--hair);
	}
	dt {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-2);
	}
	dd {
		order: -1;
		margin-bottom: 1rem;
		font-size: clamp(4.5rem, 10vw, 9.5rem);
	}
	.of {
		color: var(--fg-3);
	}
	.stat:last-child dd {
		color: var(--lime);
	}
	.stat p {
		margin-top: 0.5rem;
		max-width: 16rem;
		font-size: 0.875rem;
		color: var(--fg-3);
	}

	.pillars {
		display: grid;
		gap: 2.5rem;
		margin-top: clamp(4rem, 9vw, 8rem);
	}
	article {
		padding-top: 1.5rem;
		border-top: 1px solid var(--hair-2);
	}
	.idx {
		font-size: 1rem;
		color: var(--lime);
	}
	h3 {
		margin-top: clamp(1.25rem, 3vw, 2.5rem);
		font-size: clamp(1.5rem, 2.2vw, 2rem);
		font-weight: 800;
		font-style: italic;
		font-stretch: 125%;
		letter-spacing: -0.02em;
		line-height: 1;
		text-transform: uppercase;
	}
	article p {
		margin-top: 1rem;
		max-width: 26rem;
		color: var(--fg-2);
	}

	@media (min-width: 900px) {
		.intro {
			grid-template-columns: minmax(0, 3fr) minmax(0, 9fr);
		}
		.eyebrow {
			padding-top: 0.9rem;
		}
		.stats {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
		.stat {
			padding: 1.75rem 1.5rem 0 1.5rem;
			border-bottom: 0;
		}
		.stat:first-child {
			padding-left: 0;
		}
		.stat + .stat {
			border-left: 1px solid var(--hair);
		}
		.pillars {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 1.5rem;
		}
	}
</style>
