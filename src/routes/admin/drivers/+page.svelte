<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import Flag from '#lib/components/Flag.svelte';
	import { countryName } from '#lib/flags.ts';
	import { t, lang } from '#lib/admin/i18n.ts';

	let { data } = $props();
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">{t().common.team}</p>
		<h1 class="a-title">{t().nav.drivers}</h1>
		<p class="a-lede">{t().drivers.lede}</p>
	</div>
	<div class="a-actions">
		<a class="btn" href="/admin/drivers/new"><Icon name="plus" /> {t().drivers.add}</a>
	</div>
</header>

{#if data.pilots.length}
	<ul class="a-list">
		{#each data.pilots as p, i (p.id)}
			<li class="a-row">
				<span class="a-plate {p.accent}">{p.number}</span>
				{#if p.photo}
					<img class="a-thumb" src={p.photo} alt="" />
				{/if}
				<span class="grow">
					<a class="name" href="/admin/drivers/{p.id}">{p.first} {p.last}</a>
					<span class="meta"
						><Flag code={p.country} />{t().drivers.meta(p.category, p.age, countryName(p.country, lang()))}</span
					>
				</span>
				<span class="tools">
					<form method="post" action="?/move" use:enhance>
						<input type="hidden" name="id" value={p.id} />
						<button class="a-icon-btn" name="dir" value="up" disabled={i === 0} aria-label={t().common.up(p.first)}>
							<Icon name="up" />
						</button>
						<button
							class="a-icon-btn"
							name="dir"
							value="down"
							disabled={i === data.pilots.length - 1}
							aria-label={t().common.down(p.first)}
						>
							<Icon name="down" />
						</button>
					</form>
					<a class="a-icon-btn" href="/admin/drivers/{p.id}" aria-label={t().common.edit(`${p.first} ${p.last}`)}>
						<Icon name="edit" />
					</a>
				</span>
			</li>
		{/each}
	</ul>
{:else}
	<div class="a-list a-empty">
		<p>{t().drivers.empty}</p>
		<a class="btn" href="/admin/drivers/new"><Icon name="plus" /> {t().drivers.addFirst}</a>
	</div>
{/if}
