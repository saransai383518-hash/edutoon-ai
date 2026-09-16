import type { JsonRequest, JsonResponse } from './_lib/http';
import { readJsonBody, sendError, sendJson } from './_lib/http';
import { analyzeImage } from './_lib/gemini';

export default async function handler(request: JsonRequest, response: JsonResponse) {
	console.info('API REQUEST RECEIVED', { route: '/api/analyze-image', method: request.method });
	if (request.method !== 'POST') {
		sendJson(response, 405, { success: false, error: 'Method not allowed.', code: 'INVALID_REQUEST' });
		return;
	}

	try {
		const body = await readJsonBody(request);
		const image = body.image;
		const language = typeof body.language === 'string' ? body.language : 'en';
		if (typeof image !== 'string' || !image.trim()) {
			sendJson(response, 400, { success: false, error: 'Image data is required in request body.', code: 'INVALID_REQUEST' });
			return;
		}
		const result = await analyzeImage(image, language);
		sendJson(response, 200, { success: true, result, ...result });
	} catch (error) {
		sendError(response, error);
	}
}