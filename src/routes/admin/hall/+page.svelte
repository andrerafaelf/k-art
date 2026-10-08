<script lang="ts">
	import Icon from '#lib/admin/Icon.svelte';
	import { t } from '#lib/admin/i18n.ts';

	let { data } = $props();
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">{t().common.team}</p>
		<h1 class="a-title">{t().nav.hall}</h1>
		<p class="a-lede">{t().hall.lede}</p>
	</div>
</header>

<section class="a-card">
	<div class="row-head">
		<div>
			<h2>{t().hall.seasons}</h2>
			<p class="a-desc">{t().hall.seasonsDesc}</p>
		</div>
		<div class="a-actions">
			{#if data.hasCalendar && !data.archived}
				<a class="btn" href="/admin/hall/seasons/new?from=calendar"><Icon name="archive" /> {t().hall.archive(data.year)}</a>
			{/if}
			<a class="btn btn-ghost" href="/admin/hall/seasons/new"><Icon name="plus" /> {t().hall.addSeason}</a>
		</div>
	</div>

	{#if data.history.length}
		<ul class="a-list">
			{#each data.history as s (s.id)}
				<li class="a-row">
					<span class="year">{s.year}</span>
					<span class="grow">
						<a class="name" href="/admin/hall/seasons/{s.id}">{s.headline.pt || s.headline.en || t().hall.untitled}</a>
						<span class="meta">
							{t().hall.seasonMeta(s.stats.rounds, s.stats.wins, s.stats.podiums, s.titles.pt.filter((x) => x.trim()).length)}
						</span>
					</span>
					<span class="tools">
						<a class="a-icon-btn" href="/admin/hall/seasons/{s.id}" aria-label={t().common.edit(String(s.year))}><Icon name="edit" /></a>
					</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="a-help">{t().hall.noSeasons}</p>
	{/if}
</section>

<section class="a-card">
	<div class="row-head">
		<div>
			<h2>{t().hall.drivers}</h2>
			<p class="a-desc">{t().hall.driversDesc}</p>
		</div>
		<div class="a-actions">
			<a class="btn btn-ghost" href="/admin/hall/drivers/new"><Icon name="plus" /> {t().hall.addDriver}</a>
		</div>
	</div>

	{#if data.alumni.length}
		<ul class="a-list">
			{#each data.alumni as a (a.id)}
				<li class="a-row">
					<span class="a-plate {a.accent}">{a.number}</span>
					<span class="grow">
						<a class="name" href="/admin/hall/drivers/{a.id}">{a.first} {a.last}</a>
						<span class="meta">{t().hall.years(a.from, a.to)}, {a.categories}{a.now.pt ? `, ${t().hall.now(a.now.pt)}` : ''}</span>
					</span>
					<span class="tools">
						<a class="a-icon-btn" href="/admin/hall/drivers/{a.id}" aria-label={t().common.edit(`${a.first} ${a.last}`)}><Icon name="edit" /></a>
					</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="a-help">{t().hall.noDrivers}</p>
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
