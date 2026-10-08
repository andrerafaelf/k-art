<script lang="ts" module>
	const PATHS = {
		overview: 'M3 3h7v7H3zM14 3h7v4h-7zM14 11h7v10h-7zM3 14h7v7H3z',
		drivers: 'M12 3a8 8 0 0 0-8 8v5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-5a8 8 0 0 0-8-8zM4 12h9a2 2 0 0 1 2 2v5',
		season: 'M5 21V4M5 4h11l-2 4 2 4H5',
		news: 'M5 4h11l3 3v13H5zM9 9h6M9 13h6M9 17h4',
		partners: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z',
		settings: 'M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6',
		plus: 'M12 5v14M5 12h14',
		up: 'M6 15l6-6 6 6',
		down: 'M6 9l6 6 6-6',
		trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
		edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
		external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
		check: 'M5 12.5l4.5 4.5L19 7',
		alert: 'M12 8v5M12 17h.01M10.3 3.9L2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
		back: 'M15 18l-6-6 6-6',
		image: 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01',
		history: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2',
		trophy: 'M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1.5A3.5 3.5 0 0 0 7.2 11M17 6h3v1.5a3.5 3.5 0 0 1-3.2 3.5M12 14v4M8.5 21h7l-.8-3H9.3z',
		archive: 'M3 5h18v4H3zM5 9v10h14V9M10 13h4',
		retire: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
		signout: 'M9 4H5v16h4M14 8l4 4-4 4M18 12H9',
		user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 21a7.5 7.5 0 0 1 15 0',
		menu: 'M4 7h16M4 12h16M4 17h16',
		close: 'M6 6l12 12M18 6L6 18',
		lock: 'M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11',
		device: 'M7.5 3h9v18h-9zM11 17.5h2',
		eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 14.75a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5z',
		bold: 'M7 4.5h5.5a3.75 3.75 0 0 1 0 7.5H7zM7 12h6.5a3.75 3.75 0 0 1 0 7.5H7z',
		italic: 'M10 4.5h8M6 19.5h8M14 4.5l-4 15',
		heading: 'M6 4.5v15M17 4.5v15M6 12h11',
		list: 'M9.5 6.5h10M9.5 12h10M9.5 17.5h10M5 6.5h.01M5 12h.01M5 17.5h.01',
		quote: 'M5 17c2.5-.5 4-2.2 4-5V7H5v5h4M14 17c2.5-.5 4-2.2 4-5V7h-4v5h4',
		link: 'M10.5 13.5a3.75 3.75 0 0 0 5.3 0l2.9-2.9a3.75 3.75 0 0 0-5.3-5.3l-1.1 1.1M13.5 10.5a3.75 3.75 0 0 0-5.3 0l-2.9 2.9a3.75 3.75 0 0 0 5.3 5.3l1.1-1.1'
	} as const;

	export type IconName = keyof typeof PATHS;
</script>

<script lang="ts">
	let { name }: { name: IconName } = $props();
</script>

<svg
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.7"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"><path d={PATHS[name]} /></svg
>
