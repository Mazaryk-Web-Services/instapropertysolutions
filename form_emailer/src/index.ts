/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Resend } from 'resend';

export default {
	async fetch(request, env) {

		const resend = new Resend(env.RESEND_API_KEY);

		const { data, error } =await resend.emails.send({
			from: 'system@mazaryk.com',
			to: 'webmaster@mazaryk.com',
			subject: 'Hello World',
			html: '<p>it works!</p>'
		});

		return Response.json({ data, error });
	},
} satisfies ExportedHandler<Env>;

