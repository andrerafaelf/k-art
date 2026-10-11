<script lang="ts">
	import { tick } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import Flag from '#lib/components/Flag.svelte';
	import { COUNTRIES, countryName } from '#lib/flags.ts';
	import { t, lang } from './i18n.ts';

	// Picks a country with its flag. Shows the current one with a Change button,
	// which opens a search over every country by its Portuguese or English name,
	// accents optional, with the matches listed underneath.

	let { name, label, value }: { name: string; label: string; value: string } = $props();

	let code = $derived(value);
	let open = $state(false);
	let query = $state('');
	let active = $state(0);

	let hidden: HTMLInputElement | undefined = $state();
	let search: HTMLInputElement | undefined = $state();
	let toggle: HTMLButtonElement | undefined = $state();

	const id = $derived(`f-${name}`);
	const fold = (s: string) =>
		s
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.toLowerCase();

	const all = $derived.by(() => {
		const here = lang();
		const there = here === 'pt' ? 'en' : 'pt';
		return COUNTRIES.map((c) => ({ code: c, name: countryName(c, here), keys: [countryName(c, here), countryName(c, there)].map(fold) })).sort(
			(a, b) => a.name.localeCompare(b.name, here)
		);
	});

	// Names that start with the search first, then a word that does, then the rest
	const matches = $derived.by(() => {
		const q = fold(query.trim());
		if (!q) return all;
		const rank = (c: (typeof all)[number]) =>
			c.code === q || c.keys.some((k) => k.startsWith(q))
				? 0
				: c.keys.some((k) => k.split(/[\s-]+/).some((w) => w.startsWith(q)))
					? 1
					: c.keys.some((k) => k.includes(q))
						? 2
						: 3;
		return all
			.map((c) => ({ c, r: rank(c) }))
			.filter((x) => x.r < 3)
			.sort((a, b) => a.r - b.r)
			.map((x) => x.c);
	});

	async function show() {
		open = true;
		query = '';
		active = Math.max(0, all.findIndex((c) => c.code === code));
		await tick();
		search?.focus();
		scrollToActive();
	}

	function close() {
		open = false;
		toggle?.focus();
	}

	function pick(c: string) {
		code = c;
		open = false;
		if (hidden) {
			// The form's unsaved-changes check listens for this
			hidden.value = c;
			hidden.dispatchEvent(new Event('change', { bubbles: true }));
		}
		toggle?.focus();
	}

	const optionId = (i: number) => `${id}-opt-${i}`;
	const scrollToActive = () => document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });

	function keys(e: KeyboardEvent) {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			const step = e.key === 'ArrowDown' ? 1 : -1;
			active = Math.min(Math.max(active + step, 0), matches.length - 1);
			tick().then(scrollToActive);
		} else if (e.key === 'Enter') {
			// Picks the highlighted country instead of submitting the form
			e.preventDefault();
			if (matches[active]) pick(matches[active].code);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			close();
		}
	}

	// Typing a search isn't an edit, so it stays out of the form's unsaved-changes
	// check. Listened to directly on the field, ahead of the form's own listener.
	const quiet: Attachment<HTMLInputElement> = (el) => {
		const onInput = (e: Event) => {
			e.stopPropagation();
			query = el.value;
			active = 0;
		};
		const onChange = (e: Event) => e.stopPropagation();
		el.addEventListener('input', onInput);
		el.addEventListener('change', onChange);
		return () => {
			el.removeEventListener('input', onInput);
			el.removeEventListener('change', onChange);
		};
	};
</script>

<div
	class="a-field wide"
	onfocusout={(e) => {
		if (open && !e.currentTarget.contains(e.relatedTarget as Node | null)) open = false;
	}}
>
	<span class="a-label" id="{id}-label">{label}</span>
	<input bind:this={hidden} type="hidden" {name} value={code} />

	<div class="current">
		<Flag code={code} />
		<span class="name">{countryName(code, lang())}</span>
		<button
			bind:this={toggle}
			type="button"
			class="btn btn-ghost change"
			aria-expanded={open}
			aria-controls="{id}-list"
			onclick={() => (open ? close() : show())}
		>
			{t().driver.countryChange}
		</button>
	</div>

	{#if open}
		<div class="picker">
			<input
				bind:this={search}
				type="search"
				role="combobox"
				autocomplete="off"
				spellcheck="false"
				aria-labelledby="{id}-label"
				aria-expanded="true"
				aria-controls="{id}-list"
				aria-activedescendant={matches[active] ? optionId(active) : undefined}
				placeholder={t().driver.countrySearch}
				onkeydown={keys}
				{@attach quiet}
			/>
			<p class="a-hint">{t().driver.countrySearchHint}</p>
			<ul id="{id}-list" role="listbox" aria-labelledby="{id}-label">
				{#each matches as c, i (c.code)}
					<!-- Keys are handled by the search field, which owns this list through aria-activedescendant -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<li
						id={optionId(i)}
						role="option"
						aria-selected={c.code === code}
						class:active={i === active}
						onmousedown={(e) => e.preventDefault()}
						onclick={() => pick(c.code)}
						onmousemove={() => (active = i)}
					>
						<Flag code={c.code} />
						<span>{c.name}</span>
					</li>
				{:else}
					<li class="none" role="presentation">{t().driver.countryNone}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.current {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 2.75rem;
		padding: 0 0.4rem 0 0.85rem;
		background: var(--input);
		border: 1px solid var(--hair-2);
		border-radius: 6px;
	}
	.current :global(.flag) {
		font-size: 1.15rem;
	}
	.name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.change {
		height: 2.1rem;
		padding: 0 0.9rem;
		font-size: 0.85rem;
		clip-path: none;
		border-radius: 4px;
	}

	.picker {
		display: grid;
		gap: 0.45rem;
		margin-top: 0.15rem;
	}
	ul {
		max-height: 16rem;
		margin: 0;
		padding: 0.3rem;
		overflow-y: auto;
		overscroll-behavior: contain;
		list-style: none;
		background: var(--input);
		border: 1px solid var(--hair-2);
		border-radius: 6px;
	}
	li {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.55rem 0.6rem;
		border-radius: 4px;
		cursor: pointer;
	}
	li :global(.flag) {
		font-size: 1.05rem;
	}
	li.active {
		background: rgb(255 255 255 / 0.07);
	}
	li[aria-selected='true'] {
		color: var(--lime);
		font-weight: 600;
	}
	li.none {
		cursor: default;
		color: var(--fg-3);
	}
</style>
