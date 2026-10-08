<script lang="ts">
	import { page } from '$app/state';
	import Icon from '#lib/admin/Icon.svelte';
	import { t } from '#lib/admin/i18n.ts';
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">{t().error.label(page.status)}</p>
		<h1 class="a-title">{page.status === 404 ? t().error.notFound : t().error.wrong}</h1>
		<p class="a-lede">
			{page.status === 404 ? t().error.notFoundText : page.status === 413 ? t().error.tooLarge : t().error.generic}
		</p>
	</div>
</header>
<a class="btn" href="/admin"><Icon name="back" /> {t().error.back}</a>
