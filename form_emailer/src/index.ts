import { Resend } from 'resend';
import sanitizeHtml from 'sanitize-html';
import { z } from "zod";
import EmailTemplater from "./EmailTemplater";

// no html at all
const config: sanitizeHtml.IOptions = {
	allowedTags: [], // No tags allowed
	allowedAttributes: {}, // No attributes allowed
};

const phoneRegex = new RegExp(
	/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const formSchema = z.object({
	name: z.string({required_error: 'Name is required'}).min(1).max(50),
	email: z.string({required_error: 'Email is required'}).email().max(40),
	number: z.string({required_error: 'Phone is required'}).max(20).regex(phoneRegex, 'Invalid Phone Number'),
	subject: z.string({required_error: 'Subject is required'}).min(1).max(50),
	message: z.string({required_error: 'Message is required'}).min(1).max(400),
});

type ContactForm = z.infer<typeof formSchema>;

const headers = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': "POST,OPTIONS"}
export default {
	async fetch(request, env) {

		if (request.method !== 'POST' )
			return Response.json({ data: null, error: 'Method not POST' }, {headers, status: 400});

		const formData = await request.formData();

		const result = formSchema.safeParse(Object.fromEntries(formData));

		if (!result.success) {
			console.error(result.error.flatten());
			return Response.json({ data: null, error: Object.values(result.error.flatten().fieldErrors).flat() }, {headers, status: 400});
		}

		const contactForm: ContactForm = result.data;

		const resend = new Resend(env.RESEND_API_KEY);

		const { data, error } =await resend.emails.send({
			from: 'system@mazaryk.com',
			to: env.TO_EMAIL,
			bcc: env.BCC_EMAIL,
			subject: 'New Contact Form Submission',
			html: new EmailTemplater()
				.addPreHeader('Website Contact From Submission')
				.addText(`Good Day,`)
				.addText(`Someone has submitted the following contact information on your website:`)
				.addBlankLine()
				.addText( ` Name: ${contactForm.name}`)
				.addText( ` Email: ${contactForm.email}`)
				.addText( ` Phone: ${contactForm.number}`)
				.addText( ` Subject: ${contactForm.subject}`)
				.addText( ` Message:`)
				.addText( ` ${sanitizeHtml(contactForm.message, config)}`)
				.addBlankLine()
				.addDefaultSignature()
				.render()
		});
		if ( error ) {
			console.log({ data, error });
			Response.json({data: null, error: 'Failed to deliver message'}, {headers, status: 500});
		}

		return Response.json({data: 'ok', error: null}, {headers, status: 200});

	},
} satisfies ExportedHandler<Env>;
