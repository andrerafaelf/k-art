<script lang="ts">
	import type { L } from '#lib/content.ts';
	import { t } from './i18n.ts';

	// One field in both languages. Portuguese is the main language; English is
	// optional and the site shows the Portuguese text when it is left empty.

	interface Props {
		name: string;
		label: string;
		value: L<string> | L<string[]>;
		hint?: string;
		errors?: Record<string, string>;
		required?: boolean;
		wide?: boolean;
		rows?: number;
		maxlength?: number;
		placeholder?: string;
	}

	let { name, label, value, hint, errors, required, wide, rows, maxlength, placeholder }: Props = $props();

	const text = (v: string | string[]) => (Array.isArray(v) ? v.join('\n') : v);
	const langs = [
		{ code: 'pt', tag: 'PT' },
		{ code: 'en', tag: 'EN' }
	] as const;
	const error = $derived(errors?.[`${name}.pt`] ?? errors?.[`${name}.en`]);
	const language = (code: 'pt' | 'en') => (code === 'pt' ? t().common.portuguese : t().common.english);
</script>

<div class="a-field" class:wide class:invalid={error}>
	<label class="a-label" for="f-{name}-pt">{label}</label>
	<div class="a-pair">
		{#each langs as { code, tag }}
			<div class="a-lang {code}">
				<span>{tag}</span>
				{#if rows}
					<textarea
						id="f-{name}-{code}"
						name="{name}.{code}"
						{rows}
						{maxlength}
						required={required && code === 'pt'}
						aria-label="{label}, {language(code)}"
						placeholder={code === 'en' ? t().common.enEmpty : placeholder}
						class:invalid={errors?.[`${name}.${code}`]}
						value={text(value[code])}
					></textarea>
				{:else}
					<input
						id="f-{name}-{code}"
						name="{name}.{code}"
						{maxlength}
						required={required && code === 'pt'}
						aria-label="{label}, {language(code)}"
						placeholder={code === 'en' ? t().common.enEmpty : placeholder}
						class:invalid={errors?.[`${name}.${code}`]}
						value={text(value[code])}
					/>
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
