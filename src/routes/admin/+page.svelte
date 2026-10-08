<script lang="ts">
	import Icon from '#lib/admin/Icon.svelte';
	import { daysUntil, longDate } from '#lib/content.ts';

	let { data } = $props();

	const days = $derived(data.next ? daysUntil(data.next, Date.now()) : 0);
	const when = $derived(days <= 0 ? 'This weekend' : days === 1 ? 'Tomorrow' : `In ${days} days`);
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">K'ART Racing Team</p>
		<h1 class="a-title">Overview</h1>
	</div>
	<div class="a-actions">
		<a class="btn btn-ghost" href="/admin/news/new"><Icon name="plus" /> Write a post</a>
		<a class="btn" href="/" target="_blank" rel="noreferrer">View the site <Icon name="external" /></a>
	</div>
</header>

<div class="tiles">
	<a class="tile next" href={data.next ? `/admin/season/${data.next.id}` : '/admin/season/new'}>
		<span class="k">Next race</span>
		{#if data.next}
			<span class="v">{data.next.location}</span>
			<span class="s">{longDate(data.next.date, 'en')}, {when.toLowerCase()}</span>
			<span class="s">Round {data.next.round} of {data.total}</span>
		{:else}
			<span class="v">None scheduled</span>
			<span class="s">Add the next round to the calendar</span>
		{/if}
	</a>
	<a class="tile" href="/admin/season">
		<span class="k">{data.year} season</span>
		<span class="v num">{data.summary.wins}<small>wins</small> {data.summary.podiums}<small>podiums</small></span>
		<span class="s">From {data.summary.raced} of {data.total} rounds, counted from the results you enter</span>
	</a>
	<a class="tile" href="/admin/drivers">
		<span class="k">Team career record</span>
		<span class="v num">{data.record.wins}<small>wins</small> {data.record.podiums}<small>podiums</small></span>
		<span class="s">Totals of every driver's record, shown in the team section</span>
	</a>
	<a class="tile" href="/admin/news">
		<span class="k">News</span>
		<span class="v num">{data.posts.published}<small>published</small></span>
		<span class="s">{data.posts.drafts} {data.posts.drafts === 1 ? 'draft' : 'drafts'}</span>
	</a>
</div>

<section class="a-card todo">
	<h2>To do</h2>
	{#if data.checks.length}
		<p class="a-desc">Suggestions based on what is on the site right now.</p>
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
		<p class="a-desc">Everything is up to date.</p>
	{/if}
</section>

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
