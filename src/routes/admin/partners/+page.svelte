<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';

	let { data } = $props();
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">K'ART Racing Team</p>
		<h1 class="a-title">Partners</h1>
		<p class="a-lede">
			Logos shown under "Our partners" on the homepage, in this order. The sponsorship packages are
			edited in <a href="/admin/settings#packages">site settings</a>.
		</p>
	</div>
	<div class="a-actions">
		<a class="btn" href="/admin/partners/new"><Icon name="plus" /> Add partner</a>
	</div>
</header>

{#if data.partners.length}
	<ul class="a-list">
		{#each data.partners as p, i (p.id)}
			<li class="a-row">
				<span class="logo {p.tone}"><img src={p.logo} alt="" /></span>
				<span class="grow">
					<a class="name" href="/admin/partners/{p.id}">{p.name}</a>
					<span class="meta">{p.url ? new URL(p.url).hostname : 'No link'}</span>
				</span>
				<span class="tools">
					<form method="post" action="?/move" use:enhance>
						<input type="hidden" name="id" value={p.id} />
						<button class="a-icon-btn" name="dir" value="up" disabled={i === 0} aria-label="Move {p.name} up">
							<Icon name="up" />
						</button>
						<button
							class="a-icon-btn"
							name="dir"
							value="down"
							disabled={i === data.partners.length - 1}
							aria-label="Move {p.name} down"
						>
							<Icon name="down" />
						</button>
					</form>
					<a class="a-icon-btn" href="/admin/partners/{p.id}" aria-label="Edit {p.name}"><Icon name="edit" /></a>
				</span>
			</li>
		{/each}
	</ul>
{:else}
	<div class="a-list a-empty">
		<p>No partners yet. The logo strip stays hidden on the site until you add the first one.</p>
		<a class="btn" href="/admin/partners/new"><Icon name="plus" /> Add a partner</a>
	</div>
{/if}

<style>
	.a-lede a {
		color: var(--fg);
		text-decoration: underline;
	}
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
