<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';

	let { data } = $props();
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">K'ART Racing Team</p>
		<h1 class="a-title">Drivers</h1>
		<p class="a-lede">
			The line-up, in the order it appears on the site. Career records are summed into the team
			stats on the homepage.
		</p>
	</div>
	<div class="a-actions">
		<a class="btn" href="/admin/drivers/new"><Icon name="plus" /> Add driver</a>
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
					<span class="meta">
						{p.category}, {p.age}, {p.record.wins} wins, {p.record.podiums} podiums, {p.record.poles} poles
					</span>
				</span>
				<span class="tools">
					<form method="post" action="?/move" use:enhance>
						<input type="hidden" name="id" value={p.id} />
						<button class="a-icon-btn" name="dir" value="up" disabled={i === 0} aria-label="Move {p.first} up">
							<Icon name="up" />
						</button>
						<button
							class="a-icon-btn"
							name="dir"
							value="down"
							disabled={i === data.pilots.length - 1}
							aria-label="Move {p.first} down"
						>
							<Icon name="down" />
						</button>
					</form>
					<a class="a-icon-btn" href="/admin/drivers/{p.id}" aria-label="Edit {p.first} {p.last}">
						<Icon name="edit" />
					</a>
				</span>
			</li>
		{/each}
	</ul>
{:else}
	<div class="a-list a-empty">
		<p>No drivers yet. The line-up section is hidden on the site until you add one.</p>
		<a class="btn" href="/admin/drivers/new"><Icon name="plus" /> Add the first driver</a>
	</div>
{/if}
