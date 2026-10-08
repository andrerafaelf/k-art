<script lang="ts">
	import { shortDate } from '#lib/content.ts';
	import type { Row } from '#lib/server/history.ts';
	import type { Change } from './changes.ts';
	import { t, lang, when } from './i18n.ts';

	// One line of the change log, in plain words: "Ana edited the driver
	// Tomás Freitas. Changed: photo, age".

	let { row, compact = false }: { row: Row; compact?: boolean } = $props();

	const m = $derived(t());
	const fields = (c: Change) => c.fields?.map((f) => m.fields[c.kind]?.[f] ?? f).join(', ');
	const initial = $derived((row.by?.name ?? '?').trim().charAt(0).toUpperCase());
	const shown = $derived(compact || row.restored ? row.changes.slice(0, 3) : row.changes);
	const hidden = $derived(row.changes.length - shown.length);
</script>

{#snippet change(c: Row['changes'][number])}
	<!-- Spaces are written as {' '}: Svelte drops plain whitespace at the edges of blocks -->
	{#if c.op === 'move'}
		{#if c.href}<a href={c.href}>{m.history.moved[c.kind]}</a>{:else}{m.history.moved[c.kind]}{/if}{#if row.count > 1}{' '}<span
				class="times">({m.history.times(row.count)})</span
			>{/if}
	{:else if c.kind === 'settings'}
		{m.history.verbs[c.op]}{' '}{#if c.href}<a href={c.href}>{m.history.nouns.settings}</a>{:else}{m.history.nouns.settings}{/if}
	{:else}
		{`${m.history.verbs[c.op]} ${m.history.nouns[c.kind]}${c.kind === 'season' && c.date ? ` ${shortDate(c.date, lang())},` : ''} `}{#if c.href}<a
				href={c.href}>{c.name}</a
			>{:else}<span class="gone">{c.name}</span>{/if}
	{/if}
	{#if !compact && c.fields?.length}
		<span class="fields">{m.history.changed(fields(c)!)}</span>
	{/if}
{/snippet}

<div class="entry" class:compact>
	<span class="who tone-{row.tone ?? 'x'}" aria-hidden="true">{row.by ? initial : ''}</span>
	<div class="what">
		{#if row.account}
			{@const a = row.account}
			<p>
				{#if a.event === 'lockout'}
					{m.history.account.lockout(a.detail ?? '')}
				{:else if a.event === 'first-account'}
					{m.history.account.firstAccount(a.name ?? '')}
				{:else}
					<strong>{row.by?.name}</strong>
					{a.event === 'signin'
						? m.history.account.signin(a.detail ?? '')
						: a.event === 'user-add'
							? m.history.account.userAdd(a.name ?? '')
							: a.event === 'user-remove'
								? m.history.account.userRemove(a.name ?? '')
								: a.event === 'user-password'
									? m.history.account.userPassword(a.name ?? '')
									: m.history.account[a.event]}
				{/if}
			</p>
		{:else if row.restored}
			<p><strong>{row.by?.name}</strong> {m.history.restored(when(row.restored, m))}</p>
			<ul class="list">
				{#each shown as c}<li>{@render change(c)}</li>{/each}
				{#if hidden > 0}<li class="more">{m.history.more(hidden)}</li>{/if}
			</ul>
		{:else if row.changes.length === 1}
			<p><strong>{row.by?.name}</strong> {@render change(row.changes[0])}</p>
		{:else}
			<p><strong>{row.by?.name}</strong></p>
			<ul class="list">
				{#each shown as c}<li>{@render change(c)}</li>{/each}
				{#if hidden > 0}<li class="more">{m.history.more(hidden)}</li>{/if}
			</ul>
		{/if}
		{#if compact}<p class="at">{when(row.at, m)}</p>{/if}
	</div>
</div>

<style>
	.entry {
		display: flex;
		gap: 0.85rem;
		min-width: 0;
	}
	.who {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.1);
		color: var(--fg-2);
		font-size: 0.8rem;
		font-weight: 800;
	}
	.tone-0 {
		background: var(--lime);
		color: var(--black);
	}
	.tone-1 {
		background: var(--cyan);
		color: var(--black);
	}
	.tone-2 {
		background: var(--plate);
		color: var(--black);
	}
	.tone-3 {
		background: var(--purple);
		color: var(--black);
	}
	.what {
		min-width: 0;
		padding-top: 0.25rem;
		line-height: 1.5;
		color: var(--fg-2);
	}
	.what strong {
		color: var(--fg);
		font-weight: 700;
	}
	.what a {
		color: var(--fg);
		text-decoration: underline;
		text-decoration-color: var(--hair-2);
		text-underline-offset: 0.2em;
		transition: text-decoration-color 0.2s;
	}
	.what a:hover {
		text-decoration-color: var(--lime);
	}
	.gone {
		color: var(--fg);
	}
	.fields {
		display: block;
		margin-top: 0.15rem;
		font-size: 0.8rem;
		color: var(--fg-3);
	}
	.list {
		margin: 0.35rem 0 0;
		padding: 0 0 0 1rem;
	}
	.list li + li {
		margin-top: 0.3rem;
	}
	.list li::marker {
		color: var(--fg-3);
	}
	.more {
		color: var(--fg-3);
		list-style: none;
		margin-left: -1rem;
	}
	.at {
		margin-top: 0.1rem;
		font-size: 0.775rem;
		color: var(--fg-3);
	}
	.compact .what {
		font-size: 0.875rem;
	}
	.compact .fields {
		display: none;
	}
</style>
