<script lang="ts">
	import Icon from '#lib/admin/Icon.svelte';
	import { t, lang } from '#lib/admin/i18n.ts';
	import { group } from '#lib/texts.ts';

	let { data } = $props();
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">{t().common.team}</p>
		<h1 class="a-title">{t().nav.texts}</h1>
		<p class="a-lede">{t().texts.lede}</p>
	</div>
</header>

<ul class="a-list pages">
	{#each data.pages as p (p.id)}
		{@const g = group(p.id)!}
		<li class="a-row">
			<span class="grow">
				<a class="name" href="/admin/texts/{p.id}">{g.label[lang()]}</a>
				<span class="meta">{g.desc[lang()]}</span>
				<span class="meta small">
					{t().texts.count(p.count)}{#if p.noEnglish}<span class="warn">, {t().texts.noEnglish.toLowerCase()}</span>{/if}
				</span>
			</span>
			<span class="tools">
				<a class="a-icon-btn" href={g.path.pt} target="_blank" rel="noreferrer" aria-label="{t().texts.view}, {g.label[lang()]}">
					<Icon name="external" />
				</a>
				<a class="btn btn-ghost" href="/admin/texts/{p.id}"><Icon name="edit" /> {t().texts.edit}</a>
			</span>
		</li>
	{/each}
</ul>

<p class="a-help auto">{t().texts.auto}</p>

<style>
	.grow {
		display: grid;
		gap: 0.25rem;
	}
	.small {
		font-size: 0.8rem;
	}
	.warn {
		color: var(--warn);
	}
	.tools {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.auto {
		max-width: 46rem;
		margin-top: 1.5rem;
	}
</style>
