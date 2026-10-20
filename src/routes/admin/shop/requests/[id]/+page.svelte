<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import { confirmFirst } from '#lib/admin/forms.ts';
	import { t, lang, when } from '#lib/admin/i18n.ts';
	import { tr } from '#lib/content.ts';
	import { STATUSES, money, parsePhone, phoneDisplay } from '#lib/shop.ts';

	let { data } = $props();

	const r = $derived(data.request);
	const phone = $derived(r.phone ? parsePhone(r.phone) : undefined);
	const onRequest = $derived(r.lines.filter((l) => l.unit === undefined).length);
	const mailto = $derived(`mailto:${r.email}?subject=${encodeURIComponent(t().request.replySubject(r.number))}`);
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/shop/requests"><Icon name="back" /> {t().nav.requests}</a>
		<h1 class="a-title">{t().request.title(r.number)}</h1>
		<p class="a-lede">{t().request.received(when(r.at, t()))}</p>
	</div>
	<div class="a-actions">
		<a class="btn btn-ghost" href="/admin/shop/requests/{r.id}/pdf" download><Icon name="download" /> {t().request.pdf}</a>
	</div>
</header>

<div class="cols">
	<section class="a-card who">
		<h2>{r.name}</h2>
		<p class="contact">
			<a href={mailto}>{r.email}</a>
			{#if r.phone}<span>{phone ? phoneDisplay(phone) : r.phone}</span>{/if}
		</p>
		{#if r.lang === 'en'}<p class="a-desc">{t().request.english}</p>{/if}
		<div class="a-actions">
			<a class="btn" href={mailto}><Icon name="mail" /> {t().request.reply}</a>
			{#if phone}
				<a class="btn btn-ghost" href="tel:+{phone}"><Icon name="phone" /> {t().request.call}</a>
				<a class="btn btn-ghost" href="https://wa.me/{phone}" target="_blank" rel="noreferrer"><Icon name="chat" /> {t().request.whatsapp}</a>
			{/if}
		</div>
		{#if r.message}
			<h3>{t().request.message}</h3>
			<blockquote>{r.message}</blockquote>
		{/if}
	</section>

	<section class="a-card">
		<h2>{t().request.status}</h2>
		<p class="a-desc">{t().request.statusDesc}</p>
		<form class="status" method="post" action="?/status" use:enhance>
			{#each STATUSES as s}
				<button class="pick" class:on={r.status === s} name="status" value={s} aria-pressed={r.status === s}>
					{#if r.status === s}<Icon name="check" />{/if}
					{t().request.mark[s]}
				</button>
			{/each}
		</form>
	</section>
</div>

<section class="a-card items">
	<h2>{t().request.items}</h2>
	<table>
		<thead>
			<tr>
				<th class="q">{t().request.qty}</th>
				<th>{t().request.item}</th>
				<th class="r">{t().request.total}</th>
			</tr>
		</thead>
		<tbody>
			{#each r.lines as l, i}
				{@const now = data.now[i]}
				<tr>
					<td class="q">{l.qty}</td>
					<td>
						{#if now}
							<a class="name" href="/admin/shop/{l.productId}">{tr(l.name, lang())}</a>
						{:else}
							<span class="name">{tr(l.name, lang())}</span>
						{/if}
						<span class="meta">
							{[l.option, l.ref, now ? t().request.stockNow(now.stock) : t().request.gone].filter(Boolean).join(' · ')}
						</span>
					</td>
					<td class="r">{l.unit === undefined ? t().request.onRequest : money(l.unit * l.qty, lang())}</td>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<td></td>
				<td class="r">{t().request.estimate}</td>
				<td class="r total">{money(r.total, lang())}</td>
			</tr>
			{#if onRequest}
				<tr>
					<td></td>
					<td class="r note" colspan="2">+ {t().requests.items(onRequest)} {t().request.onRequest}</td>
				</tr>
			{/if}
		</tfoot>
	</table>
</section>

<section class="a-card">
	<h2>{t().request.stock}</h2>
	<p class="a-desc">{t().request.stockDesc}</p>
	{#if r.stockTaken}
		<p class="taken"><Icon name="check" /> {t().request.taken(when(r.stockTaken.at, t()), r.stockTaken.by)}</p>
	{:else}
		<form method="post" action="?/take" use:enhance={confirmFirst(t().request.takeConfirm)}>
			<button class="btn btn-ghost"><Icon name="minus" /> {t().request.take}</button>
		</form>
	{/if}
</section>

<form class="a-danger a-card" method="post" action="?/delete" use:enhance={confirmFirst(t().request.delConfirm)}>
	<div>
		<h2>{t().request.del}</h2>
		<p class="a-desc">{t().request.delDesc}</p>
	</div>
	<button class="btn btn-danger"><Icon name="trash" /> {t().request.del}</button>
</form>

<style>
	.cols {
		display: grid;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.cols > .a-card {
		margin-top: 0;
	}
	.who h2 {
		font-size: 1.35rem;
	}
	.contact {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.25rem;
		margin: 0.35rem 0 1.25rem;
		color: var(--fg-2);
	}
	.contact a {
		color: var(--lime);
	}
	.who .a-actions {
		flex-wrap: wrap;
	}
	h3 {
		margin: 1.5rem 0 0.5rem;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-3);
	}
	blockquote {
		padding: 0.85rem 1rem;
		border-left: 3px solid var(--lime);
		background: var(--panel-2);
		white-space: pre-line;
	}
	.status {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.pick {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		height: 2.6rem;
		padding: 0 1rem;
		border: 1px solid var(--hair-2);
		border-radius: 6px;
		background: none;
		color: var(--fg-2);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		transition:
			border-color 0.2s,
			color 0.2s;
	}
	.pick:hover {
		color: var(--fg);
	}
	.pick.on {
		border-color: var(--lime);
		color: var(--fg);
		box-shadow: 0 0 0 3px rgb(214 249 6 / 0.1);
	}
	.pick :global(svg) {
		width: 0.95rem;
		color: var(--lime);
	}

	.items {
		margin-bottom: 1rem;
	}
	table {
		width: 100%;
		margin-top: 1rem;
		border-collapse: collapse;
	}
	th {
		padding: 0 0.5rem 0.6rem;
		border-bottom: 1px solid var(--hair-2);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--fg-3);
		text-align: left;
	}
	td {
		padding: 0.8rem 0.5rem;
		border-bottom: 1px solid var(--hair);
		vertical-align: top;
	}
	.q {
		width: 3rem;
		font-weight: 800;
	}
	.r {
		text-align: right;
		white-space: nowrap;
	}
	.name {
		display: block;
		font-weight: 600;
	}
	a.name:hover {
		color: var(--lime);
	}
	.meta {
		display: block;
		margin-top: 0.15rem;
		font-size: 0.8rem;
		color: var(--fg-3);
	}
	tfoot td {
		border-bottom: 0;
		color: var(--fg-2);
	}
	.total {
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--fg);
	}
	.note {
		padding-top: 0;
		font-size: 0.8rem;
	}
	.taken {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--fg-2);
	}
	.taken :global(svg) {
		width: 1rem;
		color: var(--lime);
	}

	@media (min-width: 900px) {
		.cols {
			grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
			align-items: start;
		}
	}
</style>
