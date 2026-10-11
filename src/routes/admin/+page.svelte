<script lang="ts">
	import Icon from '#lib/admin/Icon.svelte';
	import Entry from '#lib/admin/Entry.svelte';
	import { daysUntil, longRange } from '#lib/content.ts';
	import { t, lang } from '#lib/admin/i18n.ts';

	let { data } = $props();

	const days = $derived(data.next ? daysUntil(data.next, Date.now()) : 0);
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">{t().common.team}</p>
		<h1 class="a-title">{t().overview.title}</h1>
	</div>
	<div class="a-actions">
		<a class="btn btn-ghost" href="/admin/news/new"><Icon name="plus" /> {t().overview.write}</a>
		<a class="btn" href="/" target="_blank" rel="noreferrer">{t().nav.site} <Icon name="external" /></a>
	</div>
</header>

<div class="tiles">
	<a class="tile next" href={data.next ? `/admin/season/${data.next.id}` : '/admin/season/new'}>
		<span class="k">{t().overview.next}</span>
		{#if data.next}
			<span class="v">{data.next.location}</span>
			<span class="s">{longRange(data.next, lang())}, {t().overview.when(days)}</span>
			<span class="s">{t().overview.round(data.next.round, data.total)}</span>
		{:else}
			<span class="v">{t().overview.none}</span>
			<span class="s">{t().overview.addNext}</span>
		{/if}
	</a>
	<a class="tile" href="/admin/season">
		<span class="k">{t().overview.season(data.year)}</span>
		<span class="v num">{data.summary.wins}<small>{t().overview.wins}</small> {data.summary.podiums}<small>{t().overview.podiums}</small></span>
		<span class="s">{t().overview.fromRounds(data.summary.raced, data.total)}</span>
	</a>
	<a class="tile" href="/admin/drivers">
		<span class="k">{t().overview.lineUp}</span>
		<span class="v num">{data.drivers}<small>{t().overview.drivers(data.drivers)}</small></span>
		<span class="s">{t().overview.classes(data.classes)}</span>
	</a>
	<a class="tile" href="/admin/news">
		<span class="k">{t().overview.news}</span>
		<span class="v num">{data.posts.published}<small>{t().overview.published}</small></span>
		<span class="s">
			{t().overview.drafts(data.posts.drafts)}{#if data.posts.scheduled}, {t().overview.scheduled(data.posts.scheduled)}{/if}
		</span>
	</a>
</div>

<div class="cols">
	<section class="a-card todo">
		<h2>{t().overview.todo}</h2>
		{#if data.checks.length}
			<p class="a-desc">{t().overview.todoNote}</p>
			<ul>
				{#each data.checks as c}
					<li>
						<a href={c.href}>
							<span class="dot {c.kind}"></span>
							<span class="t">{c.text}</span>
							<Icon name="edit" />
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="a-desc">{t().overview.allDone}</p>
		{/if}
	</section>

	<section class="a-card recent">
		<h2>{t().overview.activity}</h2>
		{#if data.recent.length}
			<ul>
				{#each data.recent as row (row.id)}
					<li><Entry {row} compact /></li>
				{/each}
			</ul>
			<a class="all" href="/admin/history"><Icon name="history" /> {t().overview.activityAll}</a>
		{:else}
			<p class="a-desc">{t().overview.noActivity}</p>
		{/if}
	</section>
</div>

<style>
	.tiles {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.tile {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 1.4rem 1.4rem 1.5rem;
		background: var(--panel);
		border: 1px solid var(--hair);
		border-radius: var(--radius);
		transition:
			border-color 0.2s,
			background 0.2s;
	}
	.tile:hover {
		border-color: var(--hair-2);
		background: var(--panel-2);
	}
	.tile.next {
		background: var(--lime);
		border-color: var(--lime);
		color: var(--black);
	}
	.k {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		opacity: 0.6;
	}
	.v {
		margin-top: 0.75rem;
		font-size: 2rem;
		font-weight: 800;
		font-stretch: 125%;
		letter-spacing: -0.03em;
		line-height: 1;
		text-transform: uppercase;
		/* Long place names like Bombarral shrink to fit the tile */
		font-size: clamp(1.4rem, 2.3vw, 2rem);
		overflow-wrap: anywhere;
	}
	.v.num {
		font-size: 2.6rem;
		font-stretch: 70%;
		text-transform: none;
	}
	.v small {
		margin: 0 0.6rem 0 0.25rem;
		font-size: 0.8rem;
		font-stretch: 100%;
		font-weight: 600;
		letter-spacing: 0;
		opacity: 0.55;
	}
	.s {
		font-size: 0.825rem;
		opacity: 0.7;
	}

	.cols {
		display: grid;
		gap: 1rem;
		align-items: start;
	}
	@media (min-width: 1100px) {
		.cols {
			grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		}
	}
	.cols > .a-card + .a-card {
		margin-top: 0;
	}
	.recent ul {
		display: grid;
		gap: 1.1rem;
		margin: 1.25rem 0 0;
		padding: 0;
		list-style: none;
	}
	.recent .all {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		margin-top: 1.5rem;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--fg-2);
		transition: color 0.2s;
	}
	.recent .all:hover {
		color: var(--fg);
	}
	.recent .all :global(svg) {
		width: 0.95rem;
		color: var(--lime);
	}

	.todo ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.todo li + li {
		border-top: 1px solid var(--hair);
	}
	.todo a {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.8rem 0;
		color: var(--fg-2);
		transition: color 0.2s;
	}
	.todo a:hover {
		color: var(--fg);
	}
	.todo a :global(svg) {
		width: 0.95rem;
		margin-left: auto;
		flex-shrink: 0;
		opacity: 0.5;
	}
	.t {
		min-width: 0;
	}
	.dot {
		flex-shrink: 0;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--fg-3);
	}
	.dot.warn {
		background: var(--warn);
	}
</style>
