<script lang="ts">
	let { dir = 'right' }: { dir?: 'right' | 'left' | 'up' | 'down' | 'out' } = $props();
	const rotate = { right: 0, left: 180, up: -90, down: 90, out: -45 };
</script>

<svg viewBox="0 0 16 16" aria-hidden="true" style:rotate="{rotate[dir]}deg">
	<path d="M1.5 8h12.5M9 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" />
</svg>
