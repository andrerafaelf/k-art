<script lang="ts">
	import Icon from '#lib/admin/Icon.svelte';
	import { t, lang, when } from '#lib/admin/i18n.ts';
	import { money } from '#lib/shop.ts';

	let { data } = $props();
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/shop"><Icon name="back" /> {t().nav.shop}</a>
		<h1 class="a-title">{t().nav.requests}</h1>
		<p class="a-lede">{t().requests.lede}</p>
	</div>
</header>

<nav class="tabs" aria-label={t().nav.requests}>
	<a href="/admin/shop/requests" class:on={!data.everything} aria-current={!data.everything ? 'page' : undefined}>
		{t().requests.open} <span>{data.open}</span>
	</a>
	<a href="/admin/shop/requests?all" class:on={data.everything} aria-current={data.everything ? 'page' : undefined}>
		{t().requests.all} <span>{data.total}</span>
	</a>
</nav>

{#if data.requests.length}
	<ul class="a-list">
		{#each data.requests as r (r.id)}
			<li class="a-row" class:fresh={r.status === 'new'}>
				<span class="num">{r.number}</span>
				<span class="grow">
					<a class="name" href="/admin/shop/requests/{r.id}">{r.name}</a>
					<span class="meta">{when(r.at, t())} · {t().requests.items(r.items)}{#if r.total} · {money(r.total, lang())}{/if}</span>
				</span>
				<span class="a-chip" class:solid={r.status === 'new'} class:ok={r.status === 'answered'}>
					{t().requests.statuses[r.status]}
				</span>
				<a class="a-icon-btn" href="/admin/shop/requests/{r.id}" aria-label={t().request.title(r.number)}><Icon name="edit" /></a>
			</li>
		{/each}
	</ul>
{:else}
	<div class="a-list a-empty">
		<p>{data.total ? t().requests.emptyOpen : t().requests.empty}</p>
	</div>
{/if}

<p class="a-help note">
	<Icon name="lock" />
	<span>{t().requests.privacy}</span>
</p>

<style>
	.tabs {
		display: flex;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}
	.tabs a {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.85rem;
		border-radius: 6px;
		color: var(--fg-2);
		font-size: 0.9rem;
		font-weight: 600;
		transition:
			background 0.2s,
			color 0.2s;
	}
	.tabs a:hover {
		color: var(--fg);
	}
	.tabs a.on {
		background: rgb(214 249 6 / 0.08);
		color: var(--fg);
	}
	.tabs span {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--fg-3);
	}
	.num {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		min-width: 2.6rem;
		height: 2.2rem;
		padding-inline: 0.4rem;
		border-radius: 5px;
		background: var(--panel-2);
		color: var(--fg-2);
		font-size: 1.15rem;
		font-weight: 900;
		font-stretch: 70%;
		font-variant-numeric: tabular-nums;
	}
	.fresh .num {
		background: var(--lime);
		color: var(--black);
	}
	.note {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;
		max-width: 46rem;
		margin-top: 2rem;
	}
	.note :global(svg) {
		flex-shrink: 0;
		width: 1rem;
		margin-top: 0.1rem;
		color: var(--lime);
	}
</style>
