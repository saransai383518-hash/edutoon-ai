import { GoogleGenAI, Type } from '@google/genai';

export const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

export type ApiErrorCode =
  | 'INVALID_REQUEST'
  | 'INVALID_IMAGE'
  | 'MISSING_GEMINI_API_KEY'
  | 'GEMINI_QUOTA_EXCEEDED'
  | 'GEMINI_TEMPORARILY_UNAVAILABLE'
  | 'GEMINI_INVALID_RESPONSE'
  | 'GEMINI_API_ERROR'
  | 'INTERNAL_SERVER_ERROR';

export interface AnalysisResult {
  headline: string;
  mainSubject: string;
  primaryCategory: string;
  childDescription: string;
  funFact: string;
  detectedSubject: string;
  subjectType: string;
  characterType: string;
  characterName: string;
  childFriendlyExplanation: string;
  funFacts: string[];
  suggestedVoiceStyle: string;
  cartoonCharacter: {
    type: string;
    name: string;
    role: string;
    explanation: string;
  };
  identified: {
    objects: string[];
    animals: string[];
    plants: string[];
    people: string[];
    places: string[];
    diagrams: string[];
    educationalContent: string[];
    textFound: string;
  };
  quizQuestions: Array<{
    id?: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    encouragement: string;
  }>;
}

export class GeminiApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly providerCategory: string;

  constructor(message: string, status: number, code: ApiErrorCode, providerCategory = 'UNKNOWN') {
    super(message);
    this.name = 'GeminiApiError';
    this.status = status;
    this.code = code;
    this.providerCategory = providerCategory;
  }
}

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new GeminiApiError('GEMINI_API_KEY is missing.', 503, 'MISSING_GEMINI_API_KEY');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'edutoon-ai' } },
    });
  }
  return aiClient;
}

export function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const configuredKey = process.env.GEMINI_API_KEY?.trim();
  return message
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, '[redacted-api-key]')
    .replace(configuredKey || '__no_configured_key__', '[redacted-api-key]');
}

function providerStatus(error: any): number {
  const status = Number(error?.status ?? error?.code ?? error?.error?.code);
  return Number.isFinite(status) && status >= 400 ? status : 500;
}

function providerCategory(error: any): string {
  return error?.error?.status || error?.statusText || error?.name || 'UNKNOWN';
}

function normalizeGeminiError(error: unknown): GeminiApiError {
  if (error instanceof GeminiApiError) return error;
  const status = providerStatus(error);
  const message = safeErrorMessage(error);
  const category = providerCategory(error);
  if (status === 429) return new GeminiApiError('Gemini quota is temporarily unavailable.', 429, 'GEMINI_QUOTA_EXCEEDED', category);
  if (status === 503) return new GeminiApiError('Gemini is temporarily unavailable.', 503, 'GEMINI_TEMPORARILY_UNAVAILABLE', category);
  if (status === 401) return new GeminiApiError('Gemini credentials were rejected.', 401, 'GEMINI_API_ERROR', category);
  if (status === 403) return new GeminiApiError('Gemini denied the request.', 403, 'GEMINI_API_ERROR', category);
  if (status === 400) return new GeminiApiError('Gemini rejected the image request.', 400, 'GEMINI_API_ERROR', category);
  return new GeminiApiError(message, 500, 'GEMINI_API_ERROR', category);
}

async function retryGemini<T>(request: () => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      const normalized = normalizeGeminiError(error);
      const retry = (normalized.status === 429 || normalized.status === 503) && attempt < 3;
      console.error('GEMINI REQUEST FAILURE', {
        model: GEMINI_MODEL,
        attempt,
        status: normalized.status,
        category: normalized.providerCategory,
        willRetry: retry,
      });
      if (!retry) throw normalized;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw new GeminiApiError('Gemini retry loop ended unexpectedly.', 500, 'GEMINI_API_ERROR');
}

export async function getImagePart(imageInput: string): Promise<{ inlineData: { mimeType: string; data: string } }> {
  if (imageInput.startsWith('data:')) {
    const match = imageInput.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=\s]+)$/);
    if (!match) throw new GeminiApiError('Invalid base64 data URL format.', 400, 'INVALID_IMAGE');
    const mimeType = match[1].toLowerCase();
    const data = match[2].replace(/\s/g, '');
    if (!data) throw new GeminiApiError('Image data is empty.', 400, 'INVALID_IMAGE');
    if (!SUPPORTED_IMAGE_TYPES.has(mimeType)) throw new GeminiApiError(`Unsupported image type: ${mimeType}.`, 400, 'INVALID_IMAGE');
    if (Buffer.byteLength(data, 'base64') > MAX_IMAGE_BYTES) throw new GeminiApiError('Image is too large.', 400, 'INVALID_IMAGE');
    return { inlineData: { mimeType, data } };
  }

  if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
    const response = await fetch(imageInput);
    if (!response.ok) throw new GeminiApiError('The image URL could not be fetched.', 400, 'INVALID_IMAGE');
    const mimeType = (response.headers.get('content-type') || '').split(';')[0].toLowerCase();
    const bytes = await response.arrayBuffer();
    if (!SUPPORTED_IMAGE_TYPES.has(mimeType)) throw new GeminiApiError('The image URL did not return a supported image.', 400, 'INVALID_IMAGE');
    if (bytes.byteLength > MAX_IMAGE_BYTES) throw new GeminiApiError('Image is too large.', 400, 'INVALID_IMAGE');
    return { inlineData: { mimeType, data: Buffer.from(bytes).toString('base64') } };
  }

  const data = imageInput.replace(/\s/g, '');
  if (!data || !/^[A-Za-z0-9+/=]+$/.test(data)) throw new GeminiApiError('Invalid base64 image data.', 400, 'INVALID_IMAGE');
  if (Buffer.byteLength(data, 'base64') > MAX_IMAGE_BYTES) throw new GeminiApiError('Image is too large.', 400, 'INVALID_IMAGE');
  return { inlineData: { mimeType: 'image/jpeg', data } };
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    headline: { type: Type.STRING },
    mainSubject: { type: Type.STRING },
    primaryCategory: { type: Type.STRING },
    childDescription: { type: Type.STRING },
    funFact: { type: Type.STRING },
    detectedSubject: { type: Type.STRING },
    subjectType: { type: Type.STRING },
    characterType: { type: Type.STRING },
    characterName: { type: Type.STRING },
    childFriendlyExplanation: { type: Type.STRING },
    funFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestedVoiceStyle: { type: Type.STRING },
    cartoonCharacter: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING }, name: { type: Type.STRING }, role: { type: Type.STRING }, explanation: { type: Type.STRING },
      },
      required: ['type', 'name', 'role', 'explanation'],
    },
    identified: {
      type: Type.OBJECT,
      properties: {
        objects: { type: Type.ARRAY, items: { type: Type.STRING } },
        animals: { type: Type.ARRAY, items: { type: Type.STRING } },
        plants: { type: Type.ARRAY, items: { type: Type.STRING } },
        people: { type: Type.ARRAY, items: { type: Type.STRING } },
        places: { type: Type.ARRAY, items: { type: Type.STRING } },
        diagrams: { type: Type.ARRAY, items: { type: Type.STRING } },
        educationalContent: { type: Type.ARRAY, items: { type: Type.STRING } },
        textFound: { type: Type.STRING },
      },
      required: ['objects', 'animals', 'plants', 'people', 'places', 'diagrams', 'educationalContent', 'textFound'],
    },
    quizQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING }, question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswerIndex: { type: Type.INTEGER }, encouragement: { type: Type.STRING },
        },
        required: ['question', 'options', 'correctAnswerIndex', 'encouragement'],
      },
    },
  },
  required: ['headline', 'mainSubject', 'primaryCategory', 'childDescription', 'funFact', 'detectedSubject', 'subjectType', 'characterType', 'characterName', 'childFriendlyExplanation', 'funFacts', 'suggestedVoiceStyle', 'cartoonCharacter', 'identified', 'quizQuestions'],
};

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Record<string, unknown>;
  const identified = result.identified as Record<string, unknown> | undefined;
  return ['headline', 'mainSubject', 'primaryCategory', 'childDescription', 'funFact', 'detectedSubject', 'subjectType', 'characterType', 'characterName', 'childFriendlyExplanation', 'suggestedVoiceStyle'].every((key) => typeof result[key] === 'string')
    && Array.isArray(result.funFacts)
    && Array.isArray(result.quizQuestions)
    && Boolean(identified)
    && ['objects', 'animals', 'plants', 'people', 'places', 'diagrams', 'educationalContent'].every((key) => Array.isArray(identified?.[key]));
}

function languageInstructions(language: string): string {
  return language === 'ta'
    ? 'Generate every output string in simple, sweet, child-friendly Tamil (தமிழ்). Keep quiz options to exactly three choices.'
    : 'Use simple, clear, child-friendly English for children ages 4-8.';
}

export async function analyzeImage(image: string, language = 'en'): Promise<AnalysisResult> {
  const ai = getGenAI();
  const imagePart = await getImagePart(image);
  console.info('IMAGE RECEIVED', { mimeType: imagePart.inlineData.mimeType, bytes: Buffer.byteLength(imagePart.inlineData.data, 'base64') });
  const prompt = `You are EduToon AI, a child-friendly educational vision teacher. Analyze only the uploaded image and never invent a subject.
Identify the clearest main subject, including animals, plants, space, math, science, people, vehicles, objects, places, text, and educational content.
For an animal image, make characterType "animal", make characterName a playful version of that animal (for example Tara the Tiger), and write childFriendlyExplanation in first person as that animal explaining itself. For a plant image use "plant" and let the plant explain itself. For planets or solar systems use "astronaut" and a space/planet teacher. For math use "teacher" and explain the visible problem step by step. Choose scientist for science and teacher for everyday learning objects.
Return headline, mainSubject, primaryCategory, childDescription, funFact, detectedSubject, subjectType (animal, plant, space, math, science, human-body, vehicle, history, geography, technology, or general), characterType (animal, plant, astronaut, scientist, or teacher), characterName, childFriendlyExplanation, 2-3 funFacts, suggestedVoiceStyle, cartoonCharacter, identified, and 2-3 quizQuestions with exactly three options.
${languageInstructions(language)}`;
  console.info('GEMINI REQUEST STARTED', { model: GEMINI_MODEL });
  const response = await retryGemini(() => ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      systemInstruction: 'Always return precise, safe, child-friendly educational information about the actual image.',
      responseMimeType: 'application/json',
      responseSchema,
    },
  }));
  console.info('GEMINI HTTP STATUS', { model: GEMINI_MODEL, status: (response as any)?.status ?? 200 });
  const text = response.text?.trim();
  if (!text) throw new GeminiApiError('Gemini returned an empty analysis.', 502, 'GEMINI_INVALID_RESPONSE');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GeminiApiError('Gemini returned invalid analysis JSON.', 502, 'GEMINI_INVALID_RESPONSE');
  }
  console.info('GEMINI RESPONSE PARSING RESULT', { parsed: typeof parsed === 'object' && parsed !== null ? 'object' : typeof parsed });
  if (!isAnalysisResult(parsed)) throw new GeminiApiError('Gemini returned an incomplete analysis.', 502, 'GEMINI_INVALID_RESPONSE');
  return parsed;
}

export async function askAboutImage(image: string, question: string, language = 'en', detectedSubject = '', childFriendlyExplanation = ''): Promise<string> {
  const ai = getGenAI();
  const imagePart = await getImagePart(image);
  const response = await retryGemini(() => ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: { parts: [imagePart, { text: `You are a friendly fictional EduToon cartoon teacher. Answer this child's question only about the uploaded image. The detected subject is ${detectedSubject}. Earlier explanation: ${childFriendlyExplanation}. Use 2-4 short, safe sentences in ${language === 'ta' ? 'simple Tamil' : 'simple English'}. Question: ${question}` }] },
    config: { systemInstruction: 'Give only a child-friendly educational answer grounded in the image.' },
  }));
  const answer = response.text?.trim();
  if (!answer) throw new GeminiApiError('Gemini returned an empty answer.', 502, 'GEMINI_INVALID_RESPONSE');
  return answer;
}

export function toApiError(error: unknown): GeminiApiError {
  return normalizeGeminiError(error);
}
