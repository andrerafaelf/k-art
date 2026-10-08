<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Logo from '#lib/components/Logo.svelte';
	import Kerb from '#lib/components/Kerb.svelte';
	import Icon from '#lib/admin/Icon.svelte';
	import { t } from '#lib/admin/i18n.ts';

	let { data, form } = $props();

	let reveal = $state(false);
	let pending = $state(false);

	const switchHref = $derived.by(() => {
		const url = new URL(page.url.href);
		url.searchParams.delete('out');
		url.searchParams.set('lang', t().login.other.lang);
		return url.pathname + url.search;
	});
</script>

<div class="login">
	<a class="mark" href="/" aria-label={t().login.back}><Logo /></a>

	<section class="card">
		<Kerb />
		<div class="in">
			<p class="tag">Admin</p>
			<h1>{t().login.title}</h1>
			<p class="lede">{t().login.lede}</p>

			{#if data.locked}
				<p class="note warn" role="alert"><Icon name="lock" /> {t().login.locked}</p>
			{:else}
				{#if form?.error}
					<p class="note error" role="alert"><Icon name="alert" /> {form.error}</p>
				{:else if data.signedOut}
					<p class="note ok" role="status"><Icon name="check" /> {t().login.signedOut}</p>
				{/if}

				<form
					method="post"
					use:enhance={() => {
						pending = true;
						return async ({ update }) => {
							await update({ reset: false });
							pending = false;
						};
					}}
				>
					<div class="a-field">
						<label class="a-label" for="username">{t().login.username}</label>
						<input
							id="username"
							name="username"
							autocomplete="username"
							autocapitalize="none"
							spellcheck="false"
							required
							value={form?.username ?? ''}
						/>
					</div>
					<div class="a-field">
						<label class="a-label" for="password">{t().login.password}</label>
						<div class="pw">
							<input
								id="password"
								name="password"
								type={reveal ? 'text' : 'password'}
								autocomplete="current-password"
								required
							/>
							<button type="button" class="reveal" aria-pressed={reveal} onclick={() => (reveal = !reveal)}>
								{reveal ? t().account.hide : t().account.show}
							</button>
						</div>
					</div>
					<div class="keep">
						<label class="a-switch">
							<input type="checkbox" name="remember" checked={form?.remember ?? true} />
							{t().login.remember}
						</label>
						<p class="a-hint">{t().login.rememberHint(data.days)}</p>
					</div>
					<button class="btn go" disabled={pending}>{t().login.submit}</button>
				</form>

				<p class="forgot">{t().login.forgot}</p>
			{/if}
		</div>
	</section>

	<p class="foot">
		<a href={switchHref} data-sveltekit-reload>{t().login.other.label}</a>
		<a href="/">{t().login.back}</a>
	</p>
</div>

<style>
	.login {
		display: grid;
		justify-items: center;
		gap: 2rem;
		width: 100%;
		max-width: 26rem;
	}
	.mark {
		width: 9rem;
	}
	.card {
		width: 100%;
		overflow: hidden;
		border: 1px solid var(--hair);
		border-radius: 10px;
		background: var(--panel);
		box-shadow: 0 40px 120px rgb(0 0 0 / 0.55);
	}
	.in {
		padding: clamp(1.5rem, 5vw, 2.25rem);
	}
	.tag {
		display: inline-block;
		padding: 0.2rem 0.45rem;
		border: 1px solid var(--hair-2);
		border-radius: 4px;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-2);
	}
	h1 {
		margin-top: 1rem;
		font-size: 2.4rem;
		font-weight: 800;
		font-stretch: 125%;
		letter-spacing: -0.035em;
		line-height: 0.95;
		text-transform: uppercase;
	}
	.lede {
		margin-top: 0.6rem;
		color: var(--fg-2);
	}
	.note {
		display: flex;
		gap: 0.6rem;
		margin-top: 1.5rem;
		padding: 0.8rem 0.95rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1.45;
	}
	.note :global(svg) {
		flex-shrink: 0;
		width: 1.05rem;
		margin-top: 0.05rem;
	}
	.note.error {
		background: rgb(255 92 80 / 0.12);
		color: #ff8a80;
	}
	.note.warn {
		background: rgb(255 181 71 / 0.1);
		color: var(--warn);
	}
	.note.ok {
		background: rgb(214 249 6 / 0.1);
		color: var(--lime);
	}
	form {
		display: grid;
		gap: 1.15rem;
		margin-top: 1.75rem;
	}
	.pw {
		position: relative;
	}
	.pw input {
		padding-right: 5.5rem;
	}
	.reveal {
		position: absolute;
		top: 50%;
		right: 0.4rem;
		translate: 0 -50%;
		height: 2rem;
		padding: 0 0.7rem;
		border: 0;
		border-radius: 4px;
		background: rgb(255 255 255 / 0.07);
		color: var(--fg-2);
		font: inherit;
		font-size: 0.775rem;
		font-weight: 600;
		cursor: pointer;
	}
	.reveal:hover {
		color: var(--fg);
	}
	.keep {
		display: grid;
		gap: 0.4rem;
	}
	.keep .a-hint {
		padding-left: 3.35rem;
	}
	.go {
		justify-content: center;
		width: 100%;
		height: 3rem;
		margin-top: 0.4rem;
		clip-path: none;
		padding-right: 1.1rem;
	}
	.forgot {
		margin-top: 1.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--hair);
		font-size: 0.825rem;
		line-height: 1.5;
		color: var(--fg-3);
	}
	.foot {
		display: flex;
		gap: 1.5rem;
		font-size: 0.825rem;
	}
	.foot a {
		color: var(--fg-2);
		transition: color 0.2s;
	}
	.foot a:hover {
		color: var(--fg);
	}
</style>
