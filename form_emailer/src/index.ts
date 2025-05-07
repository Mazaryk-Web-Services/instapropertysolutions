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
