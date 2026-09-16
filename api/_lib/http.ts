import type { IncomingMessage, ServerResponse } from 'node:http';
import { GeminiApiError, toApiError, safeErrorMessage } from './gemini';

export interface JsonRequest extends IncomingMessage {
  body?: unknown;
}

export type JsonResponse = ServerResponse & {
  statusCode: number;
};

export async function readJsonBody(request: JsonRequest): Promise<Record<string, unknown>> {
  if (request.body && typeof request.body === 'object') return request.body as Record<string, unknown>;
  if (typeof request.body === 'string') return parseBody(request.body);

  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return parseBody(Buffer.concat(chunks).toString('utf8'));
}

function parseBody(raw: string): Record<string, unknown> {
  if (!raw.trim()) return {};
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new GeminiApiError('Request body must be a JSON object.', 400, 'INVALID_REQUEST');
  return parsed as Record<string, unknown>;
}

export function sendJson(response: JsonResponse, status: number, body: Record<string, unknown>): void {
  console.info('API RESPONSE', { status, success: body.success === true });
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

export function sendError(response: JsonResponse, error: unknown): void {
  const normalized = toApiError(error);
  console.error('API ERROR', {
    status: normalized.status,
    code: normalized.code,
    category: normalized.providerCategory,
    message: safeErrorMessage(normalized),
  });
  sendJson(response, normalized.status, {
    success: false,
    error: errorMessage(normalized),
    code: normalized.code,
  });
}

function errorMessage(error: GeminiApiError): string {
  switch (error.code) {
    case 'INVALID_REQUEST':
    case 'INVALID_IMAGE':
      return error.message;
    case 'MISSING_GEMINI_API_KEY':
      return 'The image analysis service is not configured.';
    case 'GEMINI_QUOTA_EXCEEDED':
      return 'The image analysis service is busy right now. Please try again in a moment.';
    case 'GEMINI_TEMPORARILY_UNAVAILABLE':
      return 'The image analysis service is temporarily unavailable. Please try again shortly.';
    case 'GEMINI_INVALID_RESPONSE':
      return 'The image analysis service returned an incomplete result. Please try again.';
    default:
      return 'The image analysis service could not complete the request. Please try again.';
  }
}
