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
	<div class="done">
		<div class="flag" aria-hidden="true"></div>
		<p class="kicker">{t.received}</p>
		<h3 class="display" tabindex="-1" bind:this={thanks}>{t.thanks(sent.name.split(' ')[0])}</h3>
		<p class="reply">{t.reply(sent.email)}</p>
		<button type="button" class="another ulink" onclick={writeAgain}>{t.another}</button>
	</div>
{:else}
	<form bind:this={form} method="POST" action="?/contact#contact" novalidate use:enhance={submit}>
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

<style>
	form {
		--err: #8a0a0a;
		/* Paler lime for the fields, brighter while one is in use */
		--well: color-mix(in srgb, #fff 42%, var(--lime));
		--well-hi: color-mix(in srgb, #fff 75%, var(--lime));
		border-top: 2px solid var(--black);
	}

	/* ---------- rows ---------- */
	.row {
		display: grid;
		gap: 0.55rem 2rem;
		padding: 0.7rem 0;
	}
	.row:first-child {
		padding-top: 1.6rem;
	}

	.label {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		line-height: 1.2;
		text-transform: uppercase;
	}
	.n {
		font-family: var(--mono);
		font-weight: 500;
		letter-spacing: 0;
		color: var(--fg-2);
	}
	.opt {
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: none;
		color: var(--fg-2);
	}

	/* Each field is a pale well in a black frame, with the cut corner of a number
	   plate. The frame is a ring laid over the edge of the well, so it can thicken
	   inwards while the field is in use without moving anything. */
	@property --frame {
		syntax: '<length>';
		inherits: true;
		initial-value: 1.5px;
	}
	.slot {
		--frame: 1.5px;
		--cut: 12px;
		position: relative;
		clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%);
		transition: --frame 0.25s var(--ease-out);
	}
	.slot::after {
		/* The inside of the ring keeps the cut parallel to the outside, the frame's width in */
		--in: calc(var(--cut) + var(--frame) * 0.414);
		content: '';
		position: absolute;
		inset: 0;
		background: var(--black);
		pointer-events: none;
		clip-path: polygon(
			evenodd,
			0 0,
			100% 0,
			100% calc(100% - var(--cut)),
			calc(100% - var(--cut)) 100%,
			0 100%,
			0 0,
			var(--frame) var(--frame),
			var(--frame) calc(100% - var(--frame)),
			calc(100% - var(--in)) calc(100% - var(--frame)),
			calc(100% - var(--frame)) calc(100% - var(--in)),
			calc(100% - var(--frame)) var(--frame),
			var(--frame) var(--frame)
		);
	}
	.slot:focus-within {
		--frame: 2.5px;
	}
	.bad .slot {
		--frame: 2px;
	}
	.bad .slot:focus-within {
		--frame: 2.5px;
	}
	.bad .slot::after {
		background: var(--err);
	}

	.in {
		display: block;
		width: 100%;
		margin: 0;
		padding: 0.85rem 1rem;
		border: 0;
		border-radius: 0;
		background: var(--well);
		color: var(--black);
		font: inherit;
		font-size: clamp(1.0625rem, 1.3vw, 1.1875rem);
		font-weight: 600;
		line-height: 1.3;
		letter-spacing: -0.01em;
		caret-color: var(--black);
		transition: background-color 0.3s var(--ease-out);
	}
	.in::placeholder {
		color: rgb(10 10 11 / 0.42);
		font-weight: 500;
		opacity: 1;
	}
	.in:hover,
	.in:focus {
		background: var(--well-hi);
	}
	.in:focus-visible {
		outline: none;
	}
	.in:-webkit-autofill {
		-webkit-text-fill-color: var(--black);
		box-shadow: 0 0 0 100px var(--well-hi) inset;
	}
	/* The resize handle would sit in the cut corner, so the box grows with the text instead */
	textarea.in {
		min-height: 9rem;
		max-height: 24rem;
		line-height: 1.45;
		resize: none;
		field-sizing: content;
	}

	.error {
		margin-top: 0.5rem;
		color: var(--err);
		font-size: 0.9375rem;
		font-weight: 600;
	}

	/* ---------- topic ---------- */
	.topics {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 0.6rem;
		padding-top: 0.15rem;
	}
	.topic {
		position: relative;
		cursor: pointer;
	}
	.topic input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}
	/* Slanted like the stroke in the logo */
	.choice {
		display: inline-flex;
		align-items: center;
		height: 2.5rem;
		padding: 0 0.95rem;
		box-shadow: inset 0 0 0 1.5px var(--black);
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		transform: skewX(-12deg);
		transition:
			background-color 0.3s var(--ease-out),
			color 0.3s var(--ease-out);
	}
	.choice > span {
		display: inline-block;
		transform: skewX(12deg);
	}
	.topic:hover .choice {
		background: rgb(10 10 11 / 0.08);
	}
	.topic input:checked + .choice {
		background: var(--black);
		color: var(--lime);
	}
	.topic input:focus-visible + .choice {
		outline: 2px solid var(--black);
		outline-offset: 3px;
	}

	/* Off screen for people, a field like any other for bots */
	.hp {
		position: absolute;
		left: -10000px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	/* Turnstile stays empty unless Cloudflare asks for a click */
	.check {
		margin-top: 1rem;
	}

	/* ---------- send ---------- */
	.foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 1rem 1.5rem;
		margin-top: 1rem;
	}
	.problem {
		flex: 1 1 18rem;
		padding: 0.85rem 1rem;
		background: var(--black);
		color: #f3f3ef;
		font-size: 0.9375rem;
		line-height: 1.45;
	}
	.problem a {
		color: var(--lime);
		font-weight: 700;
		overflow-wrap: anywhere;
	}
	.send {
		--b: var(--black);
		--c: var(--lime);
		--h: #fff;
		flex-shrink: 0;
	}
	.send:hover:not(:disabled) {
		--c: var(--black);
	}
	.send:disabled {
		cursor: progress;
	}
	.send:disabled::before {
		transform: translateY(101%);
	}
	/* Start lights while it sends: five reds come on one by one, then go out */
	.lights {
		position: relative;
		width: 3rem;
		height: 0.4rem;
		background: radial-gradient(circle, rgb(255 255 255 / 0.2) 0.17rem, transparent 0.2rem) 0 0 / 0.6rem 100% repeat-x;
	}
	.lights::after {
		content: '';
		position: absolute;
		inset: 0 auto 0 0;
		background: radial-gradient(circle, var(--red) 0.17rem, transparent 0.2rem) 0 0 / 0.6rem 100% repeat-x;
		animation: lights 1.8s steps(1) infinite;
	}
	@keyframes lights {
		0% {
			width: 0;
		}
		14% {
			width: 0.6rem;
		}
		28% {
			width: 1.2rem;
		}
		42% {
			width: 1.8rem;
		}
		56% {
			width: 2.4rem;
		}
		70% {
			width: 3rem;
		}
		88% {
			width: 0;
		}
	}

	/* ---------- sent ---------- */
	.done {
		border-top: 2px solid var(--black);
		padding-top: clamp(2rem, 4vw, 3rem);
	}
	.done > * {
		animation: in 0.9s var(--ease-out) both;
	}
	.done > :nth-child(2) {
		animation-delay: 80ms;
	}
	.done > :nth-child(3) {
		animation-delay: 140ms;
	}
	.done > :nth-child(n + 4) {
		animation-delay: 220ms;
	}
	@keyframes in {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
	}
	/* The chequered flag */
	.flag {
		width: 12.5rem;
		height: 1.25rem;
		background: conic-gradient(var(--black) 0 25%, transparent 0 50%, var(--black) 0 75%, transparent 0) 0 0 / 1.25rem 1.25rem;
	}
	.kicker {
		margin-top: 1.5rem;
		font-family: var(--mono);
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--fg-2);
	}
	.done h3 {
		margin-top: 0.6rem;
		font-size: var(--t-section);
	}
	.done h3:focus {
		outline: none;
	}
	.reply {
		margin-top: 1.1rem;
		max-width: 32rem;
		font-size: 1.125rem;
		color: var(--fg-2);
		overflow-wrap: anywhere;
	}
	.another {
		margin-top: 1.75rem;
		font-weight: 700;
	}

	@media (min-width: 720px) {
		.row {
			grid-template-columns: 10.5rem minmax(0, 1fr);
		}
		/* Labels sit level with the first line of their field */
		.label {
			padding-top: 1.2rem;
		}
		[role='radiogroup'] .label {
			padding-top: 0.95rem;
		}
	}
</style>
