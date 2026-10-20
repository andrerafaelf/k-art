<script lang="ts">
	import { tick } from 'svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { dev } from '$app/env';
	import { TURNSTILE_SITE_KEY } from '$app/env/public';
	import Arrow from './Arrow.svelte';
	import { HONEYPOT, TURNSTILE_TEST_SITE_KEY } from '#lib/contact.ts';
	import { REQUEST_LIMITS, type RequestError, type RequestFailed, type RequestResult, type RequestSent } from '#lib/shop.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { createTurnstile } from '#lib/turnstile.ts';
	import '#lib/sheet.css';

	// Sends the list to the team: the same entry sheet as the contact form, with
	// the list itself in a hidden field. The server checks it against the shop
	// again, saves it in the admin's Requests and emails the team.

	interface Props {
		result?: RequestResult;
		/** The list, encoded as for the PDF link */
		items: string;
		email: string;
		onsent: (sent: RequestSent) => void;
	}

	let { result, items, email, onsent }: Props = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.shop.form);
	const e = $derived({ ...i18n.t.contact.errors, ...i18n.t.shop.errors });

	const siteKey = TURNSTILE_SITE_KEY ?? (dev ? TURNSTILE_TEST_SITE_KEY : undefined);
	const turnstile = siteKey ? createTurnstile(siteKey) : undefined;

	let sending = $state(false);
	let early = $state<RequestError>();

	const failed = $derived(result && !('sent' in result) ? result : undefined);
	const values = $derived(failed?.values);
	const errors = $derived<RequestFailed['errors']>(failed?.errors ?? {});
	const problem = $derived(early ?? failed?.error);

	let form = $state<HTMLFormElement>();

	const submit: SubmitFunction = async ({ formData, cancel }) => {
		early = undefined;
		sending = true;
		if (turnstile) {
			const token = await turnstile.token();
			if (!token) {
				sending = false;
				early = 'bot';
				turnstile.reset();
				cancel();
				return;
			}
			formData.set('cf-turnstile-response', token);
		}
		return async ({ result, update }) => {
			await update({ reset: false });
			sending = false;
			turnstile?.reset();
			const sent = result.type === 'success' ? (result.data?.request as RequestSent | undefined) : undefined;
			if (sent?.sent) return onsent(sent);
			await tick();
			form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
		};
	};

	const invalid = (field: keyof RequestFailed['errors']) => ({
		'aria-invalid': errors[field] ? ('true' as const) : undefined,
		'aria-describedby': errors[field] ? `r-${field}-error` : undefined
	});
</script>

{#snippet error(field: keyof RequestFailed['errors'])}
	{@const code = errors[field]}
	{#if code}
		<p class="error" id="r-{field}-error">{e[code]}</p>
	{/if}
{/snippet}

<form class="sheet" bind:this={form} method="POST" action="?/request" novalidate use:enhance={submit}>
	<input type="hidden" name="items" value={items} />

	<div class="row" class:bad={errors.name}>
		<label class="label" for="r-name"><span class="n">01</span>{t.name}</label>
		<div>
			<div class="slot">
				<input
					class="in"
					id="r-name"
					name="name"
					autocomplete="name"
					placeholder={t.hints.name}
					maxlength={REQUEST_LIMITS.name}
					required
					value={values?.name ?? ''}
					{...invalid('name')}
				/>
			</div>
			{@render error('name')}
		</div>
	</div>

	<div class="row" class:bad={errors.email}>
		<label class="label" for="r-email"><span class="n">02</span>{t.email}</label>
		<div>
			<div class="slot">
				<input
					class="in"
					id="r-email"
					name="email"
					type="email"
					autocomplete="email"
					spellcheck="false"
					placeholder={t.hints.email}
					maxlength={REQUEST_LIMITS.email}
					required
					value={values?.email ?? ''}
					{...invalid('email')}
				/>
			</div>
			{@render error('email')}
		</div>
	</div>

	<div class="row" class:bad={errors.phone}>
		<label class="label" for="r-phone"><span class="n">03</span>{t.phone}<span class="opt">{t.optional}</span></label>
		<div>
			<div class="slot">
				<input
					class="in"
					id="r-phone"
					name="phone"
					type="tel"
					autocomplete="tel"
					placeholder={t.hints.phone}
					maxlength={REQUEST_LIMITS.phone}
					value={values?.phone ?? ''}
					{...invalid('phone')}
				/>
			</div>
			{@render error('phone')}
		</div>
	</div>

	<div class="row" class:bad={errors.message}>
		<label class="label" for="r-message"><span class="n">04</span>{t.message}<span class="opt">{t.optional}</span></label>
		<div>
			<div class="slot">
				<textarea
					class="in short"
					id="r-message"
					name="message"
					rows="3"
					placeholder={t.hints.message}
					maxlength={REQUEST_LIMITS.message}
					value={values?.message ?? ''}
					{...invalid('message')}
				></textarea>
			</div>
			{@render error('message')}
		</div>
	</div>

	<div class="hp" aria-hidden="true">
		<label>{i18n.t.contact.form.honeypot} <input name={HONEYPOT} tabindex="-1" autocomplete="off" /></label>
	</div>

	{#if turnstile}
		<div class="check" use:turnstile.mount></div>
	{/if}

	<div class="foot">
		{#if problem}
			<p class="problem" role="alert">
				{#if problem === 'empty' || problem === 'changed'}
					{e[problem]}
				{:else}
					{e[problem]} <a href="mailto:{email}">{email}</a>.
				{/if}
			</p>
		{/if}
		<button class="btn send" disabled={sending} aria-busy={sending}>
			{sending ? t.sending : t.send}
			{#if sending}
				<span class="lights" aria-hidden="true"></span>
			{:else}
				<Arrow />
			{/if}
		</button>
	</div>
</form>

<style>
	/* The message is optional here, so it starts smaller than on the contact form */
	:global(.sheet) textarea.short {
		min-height: 6rem;
	}
</style>
