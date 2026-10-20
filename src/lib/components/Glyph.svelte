<script lang="ts" module>
	// Small line icons for the shop, drawn like the arrow: one weight, square ends
	const PATHS = {
		plus: 'M8 2.5v11M2.5 8h11',
		minus: 'M2.5 8h11',
		check: 'M2.5 8.5l3.5 3.5 7.5-8',
		close: 'M3.5 3.5l9 9M12.5 3.5l-9 9',
		list: 'M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01',
		search: 'M7 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM10.6 10.6l3.4 3.4',
		download: 'M8 2v8.5M4.5 7.5L8 11l3.5-3.5M2.5 14h11',
		chat: 'M2.5 13.5l1-3a5.5 5.5 0 1 1 2 2z',
		mail: 'M2 3.5h12v9H2zM2 4l6 5 6-5'
	} as const;

	export type GlyphName = keyof typeof PATHS;
</script>

<script lang="ts">
	let { name }: { name: GlyphName } = $props();
</script>

<svg viewBox="0 0 16 16" aria-hidden="true"
	><path d={PATHS[name]} fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /></svg
>
