<script lang="ts">
	import Icon from '#lib/admin/Icon.svelte';

	let { data } = $props();

	const years = (a: { from: number; to: number }) => (a.from === a.to ? `${a.from}` : `${a.from} to ${a.to}`);
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">K'ART Racing Team</p>
		<h1 class="a-title">Hall of Fame</h1>
		<p class="a-lede">
			Past seasons and former drivers, shown on the homepage and at /hall-of-fame. Every title line
			counts towards the trophy total.
		</p>
	</div>
</header>

<section class="a-card">
	<div class="row-head">
		<div>
			<h2>Seasons</h2>
			<p class="a-desc">Newest first. When a season ends, archive it from the calendar in one click.</p>
		</div>
		<div class="a-actions">
			{#if data.hasCalendar && !data.archived}
				<a class="btn" href="/admin/hall/seasons/new?from=calendar"><Icon name="archive" /> Archive the {data.year} season</a>
			{/if}
			<a class="btn btn-ghost" href="/admin/hall/seasons/new"><Icon name="plus" /> Add a season</a>
		</div>
	</div>

	{#if data.history.length}
		<ul class="a-list">
			{#each data.history as s (s.id)}
				<li class="a-row">
					<span class="year">{s.year}</span>
					<span class="grow">
						<a class="name" href="/admin/hall/seasons/{s.id}">{s.headline.pt || s.headline.en || 'Untitled season'}</a>
						<span class="meta">
							{s.stats.rounds} rounds, {s.stats.wins} wins, {s.stats.podiums} podiums, {s.titles.pt.filter((t) => t.trim()).length} titles
						</span>
					</span>
					<span class="tools">
						<a class="a-icon-btn" href="/admin/hall/seasons/{s.id}" aria-label="Edit {s.year}"><Icon name="edit" /></a>
					</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="a-help">No seasons yet.</p>
	{/if}
</section>

<section class="a-card">
	<div class="row-head">
		<div>
			<h2>Former drivers</h2>
			<p class="a-desc">
				When a driver leaves, use "Move to the Hall of Fame" on their page in Drivers, or add someone
				here.
			</p>
		</div>
		<div class="a-actions">
			<a class="btn btn-ghost" href="/admin/hall/drivers/new"><Icon name="plus" /> Add a former driver</a>
		</div>
	</div>

	{#if data.alumni.length}
		<ul class="a-list">
			{#each data.alumni as a (a.id)}
				<li class="a-row">
					<span class="a-plate {a.accent}">{a.number}</span>
					<span class="grow">
						<a class="name" href="/admin/hall/drivers/{a.id}">{a.first} {a.last}</a>
						<span class="meta">{years(a)}, {a.categories}{a.now.pt ? `, now ${a.now.pt}` : ''}</span>
					</span>
					<span class="tools">
						<a class="a-icon-btn" href="/admin/hall/drivers/{a.id}" aria-label="Edit {a.first} {a.last}"><Icon name="edit" /></a>
					</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="a-help">No former drivers yet.</p>
	{/if}
</section>

<style>
	.row-head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem 2rem;
		margin-bottom: 1.25rem;
	}
	.row-head .a-desc {
		margin-bottom: 0;
	}
	.year {
		width: 3.5rem;
		font-size: 1.4rem;
		font-style: italic;
		font-stretch: 70%;
		font-weight: 900;
		color: var(--lime);
	}
</style>
