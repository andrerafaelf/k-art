<script lang="ts">
	import Icon from '#lib/admin/Icon.svelte';
	import { roundEnd, nextRound, bestResult, longDate } from '#lib/content.ts';
	import { t, lang } from '#lib/admin/i18n.ts';

	let { data } = $props();

	const now = Date.now();
	const next = $derived(nextRound(data.rounds, now));
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">{t().common.team}</p>
		<h1 class="a-title">{t().nav.season}</h1>
		<p class="a-lede">{t().season.lede}</p>
	</div>
	<div class="a-actions">
		<a class="btn" href="/admin/season/new"><Icon name="plus" /> {t().season.add}</a>
	</div>
</header>

{#if data.rounds.length}
	<ul class="a-list">
		{#each data.rounds as r (r.id)}
			{@const past = roundEnd(r) <= now}
			{@const best = bestResult(r)}
			<li class="a-row">
				<span class="rd num">{r.round}</span>
				<span class="grow">
					<a class="name" href="/admin/season/{r.id}">{r.location}</a>
					<span class="meta">{longDate(r.date, lang())}, {r.venue.pt}, {r.series.pt}</span>
				</span>
				<span class="status">
					{#if best}
						<span class="a-chip ok">P{best.pos} {best.name}{r.results.length > 1 ? ` +${r.results.length - 1}` : ''}</span>
					{:else if r === next}
						<span class="a-chip solid">{t().season.next}</span>
					{:else if past}
						<span class="a-chip warn">{t().season.needs}</span>
					{:else}
						<span class="a-chip">{t().season.upcoming}</span>
					{/if}
				</span>
				<span class="tools">
					<a class="a-icon-btn" href="/admin/season/{r.id}" aria-label={t().common.edit(t().round.title(r.round, r.location))}><Icon name="edit" /></a>
				</span>
			</li>
		{/each}
	</ul>
	<p class="a-help foot">{t().season.foot} <a href="/admin/settings">{t().season.footLink}</a>.</p>
{:else}
	<div class="a-list a-empty">
		<p>{t().season.empty}</p>
		<a class="btn" href="/admin/season/new"><Icon name="plus" /> {t().season.addFirst}</a>
	</div>
{/if}

<style>
	.rd {
		width: 2rem;
		font-size: 1.6rem;
		color: var(--fg-3);
		text-align: center;
	}
	.status {
		flex-shrink: 0;
	}
	.foot {
		margin-top: 1rem;
	}
	@media (max-width: 600px) {
		.status {
			display: none;
		}
	}
</style>
