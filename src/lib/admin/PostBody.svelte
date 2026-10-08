<script lang="ts">
	import '#lib/prose.css';
	import type { L } from '#lib/content.ts';
	import { render } from '#lib/markdown.ts';
	import Icon, { type IconName } from './Icon.svelte';
	import { t } from './i18n.ts';

	// The text of a news post, in both languages, with buttons for the few
	// formats the site supports and a preview that looks like the real page.
	// The buttons write the simple markup that lib/markdown.ts reads, so nobody
	// has to learn it.

	interface Props {
		name: string;
		label: string;
		value: L;
		hint?: string;
		errors?: Record<string, string>;
		required?: boolean;
		rows?: number;
	}

	let { name, label, value, hint, errors, required, rows = 14 }: Props = $props();

	type Code = 'pt' | 'en';
	type Format = 'bold' | 'italic' | 'heading' | 'list' | 'quote' | 'link';

	// Start from the saved text, and again whenever a save brings it back
	const saved = () => ({ pt: value.pt, en: value.en });
	let text = $state(saved());
	$effect.pre(() => {
		text = saved();
	});

	let previewing = $state({ pt: false, en: false });
	const areas: Partial<Record<Code, HTMLTextAreaElement>> = {};

	const error = $derived(errors?.[`${name}.pt`] ?? errors?.[`${name}.en`]);
	const language = (code: Code) => (code === 'pt' ? t().common.portuguese : t().common.english);

	const tools: { format: Format; icon: IconName }[] = [
		{ format: 'bold', icon: 'bold' },
		{ format: 'italic', icon: 'italic' },
		{ format: 'heading', icon: 'heading' },
		{ format: 'list', icon: 'list' },
		{ format: 'quote', icon: 'quote' },
		{ format: 'link', icon: 'link' }
	];

	/** Replaces part of the text the way typing would, so Ctrl+Z still undoes it. */
	function put(area: HTMLTextAreaElement, from: number, to: number, insert: string, select: [number, number]) {
		area.focus();
		area.setSelectionRange(from, to);
		if (!document.execCommand('insertText', false, insert)) {
			area.setRangeText(insert, from, to, 'end');
			area.dispatchEvent(new Event('input', { bubbles: true }));
		}
		area.setSelectionRange(from + select[0], from + select[1]);
	}

	function apply(code: Code, format: Format) {
		const area = areas[code];
		if (!area) return;
		const { selectionStart: start, selectionEnd: end, value: all } = area;
		const sample = t().editor.samples[format];

		if (format === 'bold' || format === 'italic' || format === 'link') {
			// Keep spaces outside the markers, or the format won't show
			const picked = all.slice(start, end);
			const lead = picked.match(/^\s*/)![0];
			const trail = picked.match(/\s*$/)![0];
			const inner = picked.trim() || sample;
			let open: string;
			let close: string;
			if (format === 'link') {
				const typed = prompt(t().editor.linkPrompt, 'https://')?.trim();
				if (!typed || typed === 'https://') return;
				const href = /^(https?:\/\/|mailto:|\/)/i.test(typed)
					? typed
					: /^[^\s/@]+@[^\s/@]+$/.test(typed)
						? `mailto:${typed}`
						: `https://${typed}`;
				open = '[';
				close = `](${href.replace(/[\s)]/g, encodeURIComponent)})`;
			} else {
				open = close = format === 'bold' ? '**' : '_';
			}
			const insert = `${lead}${open}${inner}${close}${trail}`;
			const at = lead.length + open.length;
			put(area, start, end, insert, [at, at + inner.length]);
			return;
		}

		// Headings, lists and quotes work on whole lines, as their own paragraph
		const lineStart = all.lastIndexOf('\n', start - 1) + 1;
		let lineEnd = all.indexOf('\n', end > start && all[end - 1] === '\n' ? end - 1 : end);
		if (lineEnd < 0) lineEnd = all.length;
		const lines = all
			.slice(lineStart, lineEnd)
			.split('\n')
			.map((l) => l.replace(/^(#{2,3} |[-*] |>\s?)/, '').trim())
			.filter(Boolean);
		const placeholder = !lines.length;
		if (placeholder) lines.push(sample);

		const block =
			format === 'heading'
				? `## ${lines.join(' ')}`
				: lines.map((l) => (format === 'list' ? `- ${l}` : `> ${l}`)).join('\n');
		const before = all.slice(0, lineStart);
		const after = all.slice(lineEnd);
		const pre = !before || before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
		const post = !after || after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';
		// Placeholder text is selected so typing replaces it; real text keeps the cursor at its end
		const done = pre.length + block.length;
		put(area, lineStart, lineEnd, `${pre}${block}${post}`, [placeholder ? done - sample.length : done, done]);
	}
</script>

<div class="a-field wide" class:invalid={error}>
	<label class="a-label" for="f-{name}-pt">{label}</label>
	<div class="eds">
		{#each ['pt', 'en'] as const as code}
			<div class="ed" class:invalid={errors?.[`${name}.${code}`]}>
				<div class="bar" role="toolbar" aria-label={t().editor.toolbar(language(code))}>
					<span class="tag {code}">{code.toUpperCase()}</span>
					<span class="tools">
						{#each tools as tool}
							<button
								type="button"
								class="tool"
								title={t().editor[tool.format]}
								aria-label={t().editor[tool.format]}
								disabled={previewing[code]}
								onclick={() => apply(code, tool.format)}
							>
								<Icon name={tool.icon} />
							</button>
						{/each}
					</span>
					<span class="tabs">
						<button type="button" aria-pressed={!previewing[code]} onclick={() => (previewing[code] = false)}>
							{t().editor.write}
						</button>
						<button type="button" aria-pressed={previewing[code]} onclick={() => (previewing[code] = true)}>
							<Icon name="eye" />
							{t().editor.preview}
						</button>
					</span>
				</div>
				<textarea
					id="f-{name}-{code}"
					name="{name}.{code}"
					{rows}
					required={required && code === 'pt'}
					aria-label="{label}, {language(code)}"
					placeholder={code === 'en' ? t().common.enEmpty : undefined}
					hidden={previewing[code]}
					bind:value={text[code]}
					bind:this={areas[code]}
				></textarea>
				{#if previewing[code]}
					<div class="view">
						{#if text[code].trim()}
							<!-- render() escapes everything before adding its few tags -->
							<div class="prose">{@html render(text[code])}</div>
						{:else}
							<p class="a-hint">{code === 'en' ? t().editor.emptyEn : t().editor.empty}</p>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
	{#if error}
		<p class="a-err">{error}</p>
	{:else if hint}
		<p class="a-hint">{hint}</p>
	{/if}
</div>

<style>
	.eds {
		display: grid;
		gap: 0.75rem;
	}
	.ed {
		border: 1px solid var(--hair-2);
		border-radius: 6px;
		background: var(--input);
		overflow: hidden;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}
	.ed:focus-within {
		border-color: var(--lime);
		box-shadow: 0 0 0 3px rgb(214 249 6 / 0.14);
	}
	.ed.invalid {
		border-color: var(--danger);
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem 0.75rem;
		padding: 0.4rem 0.5rem 0.4rem 0.75rem;
		border-bottom: 1px solid var(--hair);
		background: var(--panel-2);
	}
	.tag {
		padding: 0.1rem 0.3rem;
		border-radius: 3px;
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		line-height: 1.2;
		background: rgb(255 255 255 / 0.07);
		color: var(--fg-2);
	}
	.tag.pt {
		background: rgb(214 249 6 / 0.14);
		color: var(--lime);
	}
	.tools {
		display: flex;
		gap: 0.15rem;
	}
	.tool {
		display: grid;
		place-items: center;
		width: 2.1rem;
		height: 2.1rem;
		border: 0;
		border-radius: 5px;
		background: none;
		color: var(--fg-2);
		cursor: pointer;
		transition:
			background 0.2s,
			color 0.2s;
	}
	.tool:hover {
		background: rgb(255 255 255 / 0.07);
		color: var(--fg);
	}
	.tool:disabled {
		opacity: 0.3;
		pointer-events: none;
	}
	.tool :global(svg) {
		width: 1.05rem;
	}
	.tabs {
		display: flex;
		margin-left: auto;
		padding: 0.15rem;
		border-radius: 6px;
		background: rgb(0 0 0 / 0.35);
	}
	.tabs button {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		height: 1.9rem;
		padding: 0 0.7rem;
		border: 0;
		border-radius: 4px;
		background: none;
		color: var(--fg-3);
		font: inherit;
		font-size: 0.775rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background 0.2s,
			color 0.2s;
	}
	.tabs button[aria-pressed='true'] {
		background: rgb(255 255 255 / 0.1);
		color: var(--fg);
	}
	.tabs :global(svg) {
		width: 0.9rem;
	}
	.ed textarea {
		display: block;
		border: 0;
		border-radius: 0;
		background: transparent;
		min-height: 14rem;
	}
	.ed textarea:focus-visible {
		box-shadow: none;
	}
	.ed textarea[hidden] {
		display: none;
	}
	.view {
		min-height: 14rem;
		padding: 0.25rem 1.25rem 1.5rem;
	}
	.view .a-hint {
		margin-top: 1rem;
	}
	.view .prose {
		margin: 0;
		font-size: 1rem;
	}
</style>
