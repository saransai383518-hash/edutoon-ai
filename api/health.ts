import type { JsonRequest, JsonResponse } from './_lib/http';
import { sendJson } from './_lib/http';

export default function handler(_request: JsonRequest, response: JsonResponse) {
	sendJson(response, 200, {
		status: 'ok',
		time: new Date().toISOString(),
		geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
	});
}