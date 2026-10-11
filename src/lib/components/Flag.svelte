<script lang="ts">
	import { flagUrl } from '#lib/flags.ts';

	// A country's flag, sized to the text around it. Give it alt text when the
	// country's name isn't written beside it.
	let { code, alt = '', class: klass = '' }: { code: string; alt?: string; class?: string } = $props();
</script>

<img class={['flag', klass]} src={flagUrl(code)} {alt} width="20" height="15" loading="lazy" decoding="async" />

<style>
	.flag {
		display: inline-block;
		flex-shrink: 0;
		width: 1.33em;
		height: 1em;
		object-fit: cover;
		border-radius: 2px;
		/* Keeps white and pale flags from melting into the page */
		box-shadow: 0 0 0 1px rgb(255 255 255 / 0.14);
	}
</style>
