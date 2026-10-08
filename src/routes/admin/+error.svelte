<script lang="ts">
	import { page } from '$app/state';
	import Icon from '#lib/admin/Icon.svelte';
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">Error {page.status}</p>
		<h1 class="a-title">{page.status === 404 ? 'Not found' : 'Something went wrong'}</h1>
		<p class="a-lede">
			{page.status === 404
				? 'This page doesn’t exist, or the item was deleted.'
				: page.status === 413
					? 'That upload was too large for the server. Try a smaller image.'
					: (page.error?.message ?? 'Nothing was saved. Try again, and if it keeps happening, restore an earlier version from site settings.')}
		</p>
	</div>
</header>
<a class="btn" href="/admin"><Icon name="back" /> Back to the overview</a>
