<script lang="ts">
	import Icon from '#lib/admin/Icon.svelte';
	import { roundEnd, nextRound, bestResult, longDate } from '#lib/content.ts';

	let { data } = $props();

	const now = Date.now();
	const next = $derived(nextRound(data.rounds, now));
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">K'ART Racing Team</p>
		<h1 class="a-title">Calendar & results</h1>
		<p class="a-lede">
			Rounds are numbered by date automatically. Add every driver's finish after a race weekend; the
			site counts wins and podiums from them.
		</p>
	</div>
	<div class="a-actions">
		<a class="btn" href="/admin/season/new"><Icon name="plus" /> Add round</a>
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
					<span class="meta">{longDate(r.date, 'en')}, {r.venue.pt}, {r.series.pt}</span>
				</span>
				<span class="status">
					{#if best}
						<span class="a-chip ok">P{best.pos} {best.name}{r.results.length > 1 ? ` +${r.results.length - 1}` : ''}</span>
					{:else if r === next}
						<span class="a-chip solid">Next</span>
					{:else if past}
						<span class="a-chip warn">Needs results</span>
					{:else}
						<span class="a-chip">Upcoming</span>
					{/if}
				</span>
				<span class="tools">
					<a class="a-icon-btn" href="/admin/season/{r.id}" aria-label="Edit round {r.round}"><Icon name="edit" /></a>
				</span>
			</li>
		{/each}
	</ul>
	<p class="a-help foot">The season year and calendar introduction are in <a href="/admin/settings">site settings</a>.</p>
{:else}
	<div class="a-list a-empty">
		<p>No rounds yet. The calendar section is hidden on the site until you add one.</p>
		<a class="btn" href="/admin/season/new"><Icon name="plus" /> Add the first round</a>
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
	.foot a {
		color: var(--fg-2);
		text-decoration: underline;
	}
	@media (max-width: 600px) {
		.status {
			display: none;
		}
	}
</style>
