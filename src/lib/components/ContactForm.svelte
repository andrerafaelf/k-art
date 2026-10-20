<script lang="ts">
	import { tick } from 'svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { dev } from '$app/env';
	import { TURNSTILE_SITE_KEY } from '$app/env/public';
	import Arrow from './Arrow.svelte';
	import {
		HONEYPOT,
		LIMITS,
		TOPICS,
		TURNSTILE_TEST_SITE_KEY,
		type ContactFailed,
		type ContactResult,
		type FormError
	} from '#lib/contact.ts';
	import { useI18n } from '#lib/i18n.ts';
	import { createTurnstile } from '#lib/turnstile.ts';
	import '#lib/sheet.css';

	// Laid out like an entry sheet: numbered rows, each field a framed slot. It
	// works without JavaScript too, the server answers with the page and any problems.

	let { result, email }: { result?: ContactResult; email: string } = $props();

	const i18n = useI18n();
	const t = $derived(i18n.t.contact.form);
	const e = $derived(i18n.t.contact.errors);

	const siteKey = TURNSTILE_SITE_KEY ?? (dev ? TURNSTILE_TEST_SITE_KEY : undefined);
	const turnstile = siteKey ? createTurnstile(siteKey) : undefined;

	let sending = $state(false);
	/** Showing the form again after a message went through */
	let again = $state(false);
	/** A problem found before the message reached the server */
	let early = $state<FormError>();

	const sent = $derived(result && 'sent' in result && !again ? result : undefined);
	const failed = $derived(result && !('sent' in result) ? result : undefined);
	const values = $derived(failed?.values);
	const errors = $derived<ContactFailed['errors']>(failed?.errors ?? {});
	const problem = $derived(early ?? failed?.error);

	let form = $state<HTMLFormElement>();
	let thanks = $state<HTMLElement>();

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
		return async ({ update }) => {
			await update({ reset: false, refreshAll: false });
			sending = false;
			again = false;
			turnstile?.reset();
			// Take keyboard and screen reader users to what changed
			await tick();
			if (sent) thanks?.focus();
			else form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
		};
	};

	async function writeAgain() {
		again = true;
		early = undefined;
		await tick();
		form?.querySelector('input')?.focus();
	}

	const invalid = (field: keyof ContactFailed['errors']) => ({
		'aria-invalid': errors[field] ? ('true' as const) : undefined,
		'aria-describedby': errors[field] ? `c-${field}-error` : undefined
	});
</script>

{#snippet error(field: keyof ContactFailed['errors'])}
	{@const code = errors[field]}
	{#if code}
		<p class="error" id="c-{field}-error">{e[code]}</p>
	{/if}
{/snippet}

{#if sent}
	<div class="sheet done">
		<div class="flag" aria-hidden="true"></div>
		<p class="kicker">{t.received}</p>
		<h3 class="display" tabindex="-1" bind:this={thanks}>{t.thanks(sent.name.split(' ')[0])}</h3>
		<p class="reply">{t.reply(sent.email)}</p>
		<button type="button" class="another ulink" onclick={writeAgain}>{t.another}</button>
	</div>
{:else}
	<form class="sheet" bind:this={form} method="POST" action="?/contact#contact" novalidate use:enhance={submit}>
		<div class="row" class:bad={errors.name}>
			<label class="label" for="c-name"><span class="n">01</span>{t.name}</label>
			<div>
				<div class="slot">
					<input
						class="in"
						id="c-name"
						name="name"
						autocomplete="name"
						placeholder={t.hints.name}
						maxlength={LIMITS.name}
						required
						value={values?.name ?? ''}
						{...invalid('name')}
					/>
				</div>
				{@render error('name')}
			</div>
		</div>

		<div class="row" class:bad={errors.email}>
			<label class="label" for="c-email"><span class="n">02</span>{t.email}</label>
			<div>
				<div class="slot">
					<input
						class="in"
						id="c-email"
						name="email"
						type="email"
						autocomplete="email"
						spellcheck="false"
						placeholder={t.hints.email}
						maxlength={LIMITS.email}
						required
						value={values?.email ?? ''}
						{...invalid('email')}
					/>
				</div>
				{@render error('email')}
			</div>
		</div>

		<div class="row" role="radiogroup" aria-labelledby="c-topic">
			<span class="label" id="c-topic"><span class="n">03</span>{t.topic}<span class="opt">{t.optional}</span></span>
			<div class="topics">
				{#each TOPICS as topic (topic)}
					<label class="topic">
						<input type="radio" name="topic" value={topic} checked={values?.topic === topic} />
						<span class="choice"><span>{t.topics[topic]}</span></span>
					</label>
				{/each}
			</div>
		</div>

		<div class="row" class:bad={errors.message}>
			<label class="label" for="c-message"><span class="n">04</span>{t.message}</label>
			<div>
				<div class="slot">
					<textarea
						class="in"
						id="c-message"
						name="message"
						rows="5"
						placeholder={t.hints.message}
						maxlength={LIMITS.message}
						required
						value={values?.message ?? ''}
						{...invalid('message')}
					></textarea>
				</div>
				{@render error('message')}
			</div>
		</div>

		<div class="hp" aria-hidden="true">
			<label>{t.honeypot} <input name={HONEYPOT} tabindex="-1" autocomplete="off" /></label>
		</div>

		{#if turnstile}
			<div class="check" use:turnstile.mount></div>
		{/if}

		<div class="foot">
			{#if problem}
				<p class="problem" role="alert">{e[problem]} <a href="mailto:{email}">{email}</a>.</p>
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
{/if}
