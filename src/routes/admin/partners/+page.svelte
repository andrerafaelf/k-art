<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import { t } from '#lib/admin/i18n.ts';

	let { data } = $props();
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">{t().common.team}</p>
		<h1 class="a-title">{t().nav.partners}</h1>
		<p class="a-lede">{t().partners.lede} <a href="/admin/settings#packages">{t().partners.ledeLink}</a>.</p>
	</div>
	<div class="a-actions">
		<a class="btn" href="/admin/partners/new"><Icon name="plus" /> {t().partners.add}</a>
	</div>
</header>

{#if data.partners.length}
	<ul class="a-list">
		{#each data.partners as p, i (p.id)}
			<li class="a-row">
				<span class="logo {p.tone}"><img src={p.logo} alt="" /></span>
				<span class="grow">
					<a class="name" href="/admin/partners/{p.id}">{p.name}</a>
					<span class="meta">{p.url ? new URL(p.url).hostname : t().partners.noLink}</span>
				</span>
				<span class="tools">
					<form method="post" action="?/move" use:enhance>
						<input type="hidden" name="id" value={p.id} />
						<button class="a-icon-btn" name="dir" value="up" disabled={i === 0} aria-label={t().common.up(p.name)}>
							<Icon name="up" />
						</button>
						<button
							class="a-icon-btn"
							name="dir"
							value="down"
							disabled={i === data.partners.length - 1}
							aria-label={t().common.down(p.name)}
						>
							<Icon name="down" />
						</button>
					</form>
					<a class="a-icon-btn" href="/admin/partners/{p.id}" aria-label={t().common.edit(p.name)}><Icon name="edit" /></a>
				</span>
			</li>
		{/each}
	</ul>
{:else}
	<div class="a-list a-empty">
		<p>{t().partners.empty}</p>
		<a class="btn" href="/admin/partners/new"><Icon name="plus" /> {t().partners.addFirst}</a>
	</div>
{/if}

<style>
	.logo {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 5.5rem;
		height: 3rem;
		padding: 0.4rem 0.6rem;
		border-radius: 5px;
		background: var(--panel-2);
	}
	.logo.light {
		background: #efeee9;
	}
	.logo img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}
</style>
