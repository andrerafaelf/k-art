<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Icon from '#lib/admin/Icon.svelte';
	import Entry from '#lib/admin/Entry.svelte';
	import { confirmFirst } from '#lib/admin/forms.ts';
	import { t, when, dayHeading, dayKey } from '#lib/admin/i18n.ts';

	let { data } = $props();

	// Group the rows by day, newest first
	const days = $derived.by(() => {
		const out: { key: string; label: string; rows: typeof data.rows }[] = [];
		for (const row of data.rows) {
			const key = dayKey(new Date(row.at));
			if (out.at(-1)?.key !== key) out.push({ key, label: dayHeading(row.at, t()), rows: [] });
			out.at(-1)!.rows.push(row);
		}
		return out;
	});

	const href = (change: Record<string, string | number | undefined>) => {
		const url = new URL(page.url.href);
		for (const [k, v] of Object.entries(change)) {
			if (v === undefined || v === '' || v === 1) url.searchParams.delete(k);
			else url.searchParams.set(k, String(v));
		}
		if (!('page' in change)) url.searchParams.delete('page');
		return url.pathname + url.search;
	};

	const time = (iso: string) =>
		new Intl.DateTimeFormat(t().locale, { timeZone: 'Atlantic/Madeira', hour: '2-digit', minute: '2-digit' }).format(
			new Date(iso)
		);
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">{t().common.team}</p>
		<h1 class="a-title">{t().nav.history}</h1>
		<p class="a-lede">{t().history.lede}</p>
	</div>
</header>

<div class="filters">
	<div class="seg" role="group" aria-label={t().history.show}>
		<a href={href({ show: undefined })} class:on={!data.all} aria-current={!data.all ? 'true' : undefined}>{t().history.content}</a>
		<a href={href({ show: 'all' })} class:on={data.all} aria-current={data.all ? 'true' : undefined}>{t().history.all}</a>
	</div>
	{#if data.people.length > 1}
		<div class="seg" role="group" aria-label={t().history.who}>
			<a href={href({ who: undefined })} class:on={!data.who}>{t().history.everyone}</a>
			{#each data.people as p (p.id)}
				<a href={href({ who: p.id })} class:on={data.who === p.id}>{p.name}</a>
			{/each}
		</div>
	{/if}
</div>

{#if days.length}
	{#each days as day (day.key)}
		<section class="day">
			<h2>{day.label}</h2>
			<ol class="a-list">
				{#each day.rows as row (row.id)}
					<li class="item">
						<span class="time num">{time(row.at)}</span>
						<div class="body"><Entry {row} /></div>
						{#if row.backup}
							<form
								method="post"
								action="?/restore"
								use:enhance={confirmFirst(t().history.undoConfirm(when(row.at, t())))}
							>
								<input type="hidden" name="backup" value={row.backup} />
								<button class="btn btn-ghost btn-sm"><Icon name="history" /> {t().history.undo}</button>
							</form>
						{/if}
					</li>
				{/each}
			</ol>
		</section>
	{/each}
{:else}
	<div class="a-list a-empty">
		<p>{t().history.empty}</p>
	</div>
{/if}

{#if data.page > 1 || data.more}
	<nav class="pager">
		{#if data.page > 1}<a class="btn btn-ghost" href={href({ page: data.page - 1 })}>{t().history.newer}</a>{/if}
		{#if data.more}<a class="btn btn-ghost" href={href({ page: data.page + 1 })}>{t().history.older}</a>{/if}
	</nav>
{/if}

{#if data.earlier.length}
	<section class="a-card earlier">
		<h2>{t().history.earlier}</h2>
		<p class="a-desc">{t().history.earlierDesc}</p>
		<ul>
			{#each data.earlier as b (b.name)}
				<li>
					<span>{when(b.saved, t())}</span>
					<form method="post" action="?/restore" use:enhance={confirmFirst(t().history.restoreConfirm)}>
						<input type="hidden" name="backup" value={b.name} />
						<button class="btn btn-ghost btn-sm">{t().history.restore}</button>
					</form>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 2rem;
	}
	.seg {
		display: flex;
		flex-wrap: wrap;
		padding: 0.2rem;
		border: 1px solid var(--hair);
		border-radius: 8px;
		background: var(--panel);
	}
	.seg a {
		padding: 0.45rem 0.8rem;
		border-radius: 6px;
		font-size: 0.825rem;
		font-weight: 600;
		color: var(--fg-3);
		transition:
			background 0.2s,
			color 0.2s;
	}
	.seg a:hover {
		color: var(--fg);
	}
	.seg a.on {
		background: rgb(255 255 255 / 0.09);
		color: var(--fg);
	}
	.day + .day {
		margin-top: 2rem;
	}
	.day h2 {
		margin-bottom: 0.75rem;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	.item {
		display: grid;
		grid-template-columns: 3.25rem minmax(0, 1fr);
		align-items: start;
		gap: 0.5rem 1rem;
		padding: 1rem 1.1rem;
	}
	.time {
		padding-top: 0.45rem;
		font-size: 0.85rem;
		color: var(--fg-3);
		font-variant-numeric: tabular-nums;
	}
	.item form {
		grid-column: 2;
		justify-self: start;
	}
	/* Quiet until the row is pointed at, so a long history doesn't shout */
	.item .btn {
		--c: var(--fg-3);
		box-shadow: inset 0 0 0 1px var(--hair);
	}
	.item:hover .btn,
	.item .btn:focus-visible {
		--c: var(--fg);
		box-shadow: inset 0 0 0 1px var(--hair-2);
	}
	@media (hover: none) {
		.item .btn {
			--c: var(--fg-2);
		}
	}
	@media (min-width: 760px) {
		.item {
			grid-template-columns: 3.25rem minmax(0, 1fr) auto;
		}
		.item form {
			grid-column: 3;
			justify-self: end;
			padding-top: 0.1rem;
		}
	}
	.pager {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1.5rem;
	}
	.pager a:only-child {
		margin-left: auto;
	}
	.earlier {
		margin-top: 3rem;
	}
	.earlier ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.earlier li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.6rem 0;
		border-top: 1px solid var(--hair);
		font-variant-numeric: tabular-nums;
	}
</style>
