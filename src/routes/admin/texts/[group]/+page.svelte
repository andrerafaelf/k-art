<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import LangField from '#lib/admin/LangField.svelte';
	import SaveBar from '#lib/admin/SaveBar.svelte';
	import { keep } from '#lib/admin/forms.ts';
	import { t, lang } from '#lib/admin/i18n.ts';
	import { group, type TextKey } from '#lib/texts.ts';
	import type { L } from '#lib/content.ts';

	let { data, form } = $props();

	const g = $derived(group(data.id)!);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);

	// Each part of the page is a box of its own, and fields that belong together,
	// such as one of the three blocks, are grouped inside it
	type Field = (typeof g.fields)[number];
	type Section = { set?: L; fields: Field[] };
	const parts = $derived.by(() => {
		const out: { part?: L; sections: Section[] }[] = [];
		for (const f of g.fields) {
			const part = 'part' in f ? (f.part as L | undefined) : undefined;
			const set = 'set' in f ? (f.set as L | undefined) : undefined;
			let p = out.at(-1);
			if (!p || p.part?.pt !== part?.pt) out.push((p = { part, sections: [] }));
			const last = p.sections.at(-1);
			if (last && set && last.set?.pt === set.pt) last.fields.push(f);
			else p.sections.push({ set, fields: [f] });
		}
		return out;
	});
	const value = (f: Field) => data.values[f.key as TextKey] ?? f.start;
	const hint = (f: Field) => ('hint' in f ? (f.hint as L | undefined)?.[lang()] : undefined);
</script>

<header class="a-head">
	<div>
		<a class="a-crumb" href="/admin/texts"><Icon name="back" /> {t().nav.texts}</a>
		<h1 class="a-title">{g.label[lang()]}</h1>
		<p class="a-lede">{g.desc[lang()]}</p>
	</div>
	<div class="a-actions">
		<a class="btn btn-ghost" href={g.path.pt} target="_blank" rel="noreferrer">{t().texts.view} <Icon name="external" /></a>
	</div>
</header>

<form method="post" action="?/save" use:enhance={keep} novalidate>
	<p class="a-help intro">{t().texts.desc}</p>
	<div class="a-stack">
		{#each parts as p, n (n)}
			<section class="a-card">
				{#if p.part}
					<h2>{p.part[lang()]}</h2>
				{/if}
				{#each p.sections as s, i (i)}
					{#if s.set}
						<fieldset class="set">
							<legend>{s.set[lang()]}</legend>
							<div class="a-fields">
								{#each s.fields as f (f.key)}
									{@render one(f)}
								{/each}
							</div>
						</fieldset>
					{:else}
						<div class="a-fields solo">
							{#each s.fields as f (f.key)}
								{@render one(f)}
							{/each}
						</div>
					{/if}
				{/each}
			</section>
		{/each}
	</div>

	<SaveBar cancel="/admin/texts" label={t().texts.saveBtn} rev={data.rev} />
</form>

{#snippet one(f: Field)}
	<LangField
		name={f.key}
		label={f.label[lang()]}
		value={value(f)}
		errors={e}
		hint={hint(f)}
		rows={f.kind === 'line' ? undefined : f.kind === 'lines' ? (f.maxLines ?? 3) : 3}
		maxlength={f.kind === 'lines' ? undefined : f.max}
		required
		wide={f.kind !== 'line' || !('set' in f)}
	/>
{/snippet}

<style>
	.intro {
		max-width: 46rem;
		margin-bottom: 1.25rem;
	}
	h2 + .solo {
		margin-top: 1rem;
	}
	.solo + .solo,
	.solo + .set,
	.set + .solo {
		margin-top: 1.15rem;
	}
	.set {
		margin: 1.5rem 0 0;
		padding: 1.25rem 0 0;
		border: 0;
		border-top: 1px solid var(--hair);
	}
	legend {
		float: left;
		width: 100%;
		margin-bottom: 1rem;
		padding: 0;
		font-weight: 700;
	}
	.set .a-fields {
		clear: both;
	}
</style>
