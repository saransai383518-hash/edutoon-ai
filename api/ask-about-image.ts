import type { JsonRequest, JsonResponse } from './_lib/http';
import { readJsonBody, sendError, sendJson } from './_lib/http';
import { askAboutImage } from './_lib/gemini';

export default async function handler(request: JsonRequest, response: JsonResponse) {
	console.info('API REQUEST RECEIVED', { route: '/api/ask-about-image', method: request.method });
	if (request.method !== 'POST') {
		sendJson(response, 405, { success: false, error: 'Method not allowed.', code: 'INVALID_REQUEST' });
		return;
	}

	try {
		const body = await readJsonBody(request);
		const image = body.image;
		const question = body.question;
		if (typeof image !== 'string' || !image.trim() || typeof question !== 'string' || !question.trim()) {
			sendJson(response, 400, { success: false, error: 'A picture and question are required.', code: 'INVALID_REQUEST' });
			return;
		}
		const answer = await askAboutImage(
			image,
			question,
			typeof body.language === 'string' ? body.language : 'en',
			typeof body.detectedSubject === 'string' ? body.detectedSubject : '',
			typeof body.childFriendlyExplanation === 'string' ? body.childFriendlyExplanation : '',
		);
		sendJson(response, 200, { success: true, answer });
	} catch (error) {
		sendError(response, error);
	}
}