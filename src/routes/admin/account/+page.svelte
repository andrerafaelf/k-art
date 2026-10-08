<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import Icon from '#lib/admin/Icon.svelte';
	import TextField from '#lib/admin/TextField.svelte';
	import { confirmFirst } from '#lib/admin/forms.ts';
	import { t, when } from '#lib/admin/i18n.ts';

	let { data, form } = $props();

	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	let reveal = $state(false);

	/** Keeps typed values after a failed save, and clears password fields after a good one */
	const keepTyped: SubmitFunction = ({ formElement }) => {
		return async ({ update, result }) => {
			await update({ reset: result.type === 'success' });
			if (result.type === 'success') formElement.closest('details')?.removeAttribute('open');
		};
	};
</script>

<header class="a-head">
	<div>
		<p class="a-crumb">{t().common.team}</p>
		<h1 class="a-title">{t().account.title}</h1>
		<p class="a-lede">{t().account.lede}</p>
	</div>
</header>

<div class="a-stack">
	<form class="a-card" method="post" action="?/profile" use:enhance={() => async ({ update }) => update({ reset: false })}>
		<h2>{t().account.details}</h2>
		<div class="a-fields">
			<TextField name="name" label={t().account.name} value={data.me.name} error={e.name} hint={t().account.nameHint} maxlength={40} required />
			<TextField
				name="username"
				label={t().account.username}
				value={data.me.username}
				error={e.username}
				hint={t().account.usernameHint}
				autocomplete="username"
				autocapitalize="none"
				spellcheck="false"
				required
			/>
			<div class="a-field wide">
				<span class="a-label">{t().account.language}</span>
				<div class="a-choices">
					<label class="a-choice">
						<input type="radio" name="lang" value="pt" checked={data.me.lang === 'pt'} />
						<span class="flag">PT</span> Português
					</label>
					<label class="a-choice">
						<input type="radio" name="lang" value="en" checked={data.me.lang === 'en'} />
						<span class="flag">EN</span> English
					</label>
				</div>
			</div>
		</div>
		<div class="row-end">
			<button class="btn">{t().account.saveDetails}</button>
		</div>
	</form>

	<form class="a-card" method="post" action="?/password" use:enhance={keepTyped}>
		<h2>{t().account.password}</h2>
		<p class="a-desc">{t().account.passwordDesc}</p>
		<div class="a-fields">
			<TextField
				name="current"
				label={t().account.current}
				type={reveal ? 'text' : 'password'}
				error={e.current}
				autocomplete="current-password"
				required
			/>
			<TextField
				name="next"
				label={t().account.next}
				type={reveal ? 'text' : 'password'}
				error={e.next}
				hint={t().account.passwordHint(data.minPassword)}
				autocomplete="new-password"
				minlength={data.minPassword}
				required
			/>
			<TextField
				name="repeat"
				label={t().account.repeat}
				type={reveal ? 'text' : 'password'}
				error={e.repeat}
				autocomplete="new-password"
				required
			/>
		</div>
		<div class="row-end">
			<label class="a-switch">
				<input type="checkbox" bind:checked={reveal} />
				{t().account.show}
			</label>
			<button class="btn">{t().account.changePassword}</button>
		</div>
	</form>

	<section class="a-card">
		<h2>{t().account.devices}</h2>
		<p class="a-desc">{t().account.devicesDesc}</p>
		<ul class="a-list plain">
			{#each data.sessions as s (s.id)}
				<li class="a-row">
					<span class="ico"><Icon name="device" /></span>
					<span class="grow">
						<span class="name">{s.device || t().account.unknownDevice}</span>
						<span class="meta">{t().account.lastActive(when(s.seen, t()))}</span>
					</span>
					{#if s.current}
						<span class="a-chip ok">{t().account.thisDevice}</span>
					{:else}
						<form method="post" action="?/endSession" use:enhance>
							<input type="hidden" name="id" value={s.id} />
							<button class="btn btn-ghost btn-sm">{t().account.end}</button>
						</form>
					{/if}
				</li>
			{/each}
		</ul>
		{#if data.sessions.length > 1}
			<form class="row-end" method="post" action="?/endOthers" use:enhance>
				<button class="btn btn-ghost">{t().account.endOthers}</button>
			</form>
		{/if}
	</section>

	<section class="a-card">
		<h2>{t().account.people}</h2>
		<p class="a-desc">{t().account.peopleDesc}</p>
		<ul class="a-list plain">
			{#each data.people as p (p.id)}
				<li class="person">
					<div class="a-row">
						<span class="ico"><Icon name="user" /></span>
						<span class="grow">
							<span class="name">{p.name}</span>
							<span class="meta">{p.username}, {p.seen ? t().account.lastActive(when(p.seen, t())) : t().account.never}</span>
						</span>
						{#if p.id === data.me.id}<span class="a-chip ok">{t().account.you}</span>{/if}
					</div>
					{#if p.id !== data.me.id}
						<div class="tools">
							<details open={!!e[`pw_${p.id}`]}>
								<summary class="btn btn-ghost btn-sm"><Icon name="lock" /> {t().account.setPassword}</summary>
								<form class="reset" method="post" action="?/userPassword" use:enhance={keepTyped}>
									<input type="hidden" name="id" value={p.id} />
									<TextField
										name="password"
										label={t().account.setPasswordFor(p.name)}
										type="text"
										error={e[`pw_${p.id}`]}
										hint={t().account.setPasswordHint}
										autocomplete="new-password"
										spellcheck="false"
										required
									/>
									<button class="btn">{t().account.setPassword}</button>
								</form>
							</details>
							<form method="post" action="?/removeUser" use:enhance={confirmFirst(t().account.removeConfirm(p.name))}>
								<input type="hidden" name="id" value={p.id} />
								<button class="btn btn-danger btn-sm"><Icon name="trash" /> {t().account.removeAccess}</button>
							</form>
						</div>
					{/if}
				</li>
			{/each}
		</ul>

		<details class="add" open={!!(e.add_name || e.add_username || e.add_password)}>
			<summary class="btn btn-ghost"><Icon name="plus" /> {t().account.add}</summary>
			<form method="post" action="?/addUser" use:enhance={keepTyped}>
				<p class="a-desc">{t().account.addDesc}</p>
				<div class="a-fields">
					<TextField name="add_name" label={t().account.name} error={e.add_name} maxlength={40} autocomplete="off" required />
					<TextField
						name="add_username"
						label={t().account.username}
						error={e.add_username}
						autocomplete="off"
						autocapitalize="none"
						spellcheck="false"
						required
					/>
					<TextField
						name="add_password"
						label={t().account.password}
						type="text"
						error={e.add_password}
						hint={t().account.passwordHint(data.minPassword)}
						autocomplete="new-password"
						spellcheck="false"
						required
					/>
				</div>
				<div class="row-end">
					<button class="btn">{t().account.addBtn}</button>
				</div>
			</form>
		</details>
	</section>
</div>

<style>
	.a-card > h2 + .a-fields {
		margin-top: 1.25rem;
	}
	.row-end {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 1rem 1.5rem;
		margin-top: 1.5rem;
	}
	.flag {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--fg-3);
	}
	.plain {
		background: none;
	}
	.ico {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		background: var(--panel-2);
		color: var(--fg-2);
	}
	.ico :global(svg) {
		width: 1rem;
	}
	.person .tools {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0 1rem 1rem 4.35rem;
	}
	.person details {
		flex: 1 1 18rem;
	}
	summary {
		list-style: none;
		cursor: pointer;
		width: fit-content;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	.reset {
		display: grid;
		gap: 0.9rem;
		justify-items: start;
		margin-top: 1rem;
		max-width: 26rem;
	}
	.reset :global(.a-field) {
		width: 100%;
	}
	.add {
		margin-top: 1.25rem;
	}
	.add form {
		margin-top: 1.25rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--hair);
	}
	@media (max-width: 600px) {
		.person .tools {
			padding-left: 1rem;
		}
	}
</style>
