<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value'> {
		name: string;
		label: string;
		value?: string | number;
		hint?: string;
		error?: string;
		optional?: boolean;
		wide?: boolean;
		/** Renders a textarea with this many rows instead of an input */
		rows?: number;
	}

	let { name, label, value = '', hint, error, optional, wide, rows, ...rest }: Props = $props();
	const id = $derived(`f-${name.replace(/\W/g, '-')}`);
</script>

<div class="a-field" class:wide class:invalid={error}>
	<label class="a-label" for={id}>{label}{#if optional}<span class="opt">, optional</span>{/if}</label>
	{#if rows}
		<textarea {id} {name} {rows} aria-invalid={!!error} {value} placeholder={rest.placeholder}></textarea>
	{:else}
		<input {id} {name} {value} aria-invalid={!!error} {...rest} />
	{/if}
	{#if error}
		<p class="a-err">{error}</p>
	{:else if hint}
		<p class="a-hint">{hint}</p>
	{/if}
</div>
