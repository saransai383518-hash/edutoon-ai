import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const serverDirectory = process.cwd();
dotenv.config({ path: path.join(serverDirectory, '.env.local') });
dotenv.config({ path: path.join(serverDirectory, '.env') });

const app = express();
const PORT = 3000;
const GEMINI_MODEL = 'gemini-3.6-flash';
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

// Support larger payloads for camera captures and high-res image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialization for Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing. Add it to the local .env file.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

function getSafeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/AIza[0-9A-Za-z_-]{20,}/g, '[redacted-api-key]');
}

function getGeminiErrorInfo(error: any) {
  return {
    status: Number(error?.status || error?.code || 500),
    category: error?.error?.status || error?.statusText || error?.name || 'UNKNOWN',
    message: getSafeErrorMessage(error),
  };
}

async function retryTransientGeminiRequest<T>(request: () => Promise<T>): Promise<T> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await request();
    } catch (error: any) {
      const { status, category, message } = getGeminiErrorInfo(error);
      const canRetry = (status === 429 || status === 503) && attempt < maxAttempts;
      console.error('GEMINI REQUEST FAILURE:', { model: GEMINI_MODEL, attempt, status, category, message, willRetry: canRetry });
      if (!canRetry) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw new Error('Gemini retry loop ended unexpectedly.');
}

function getChildFriendlyAnalysisError(error: any): string {
  if (error?.status === 429 || error?.status === 503) {
    return 'Our cartoon teacher is helping lots of explorers right now. Please try again in a moment!';
  }
  if (error?.status === 400) {
    return 'This picture needs another try. Please choose a clear picture and try again!';
  }
  return 'Toony could not understand this picture yet. Please try again or choose another picture!';
}

// Helper to convert base64 or remote URL to Gemini image part
async function getImagePart(imageInput: string): Promise<{ inlineData: { mimeType: string; data: string } }> {
  if (imageInput.startsWith('data:')) {
    const match = imageInput.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=\s]+)$/);
    if (!match) {
      throw new Error('Invalid base64 data URL format');
    }
    const mimeType = match[1].toLowerCase();
    const data = match[2].replace(/\s/g, '');
    if (!data) {
      throw new Error('Image data is empty');
    }
    if (!SUPPORTED_IMAGE_TYPES.has(mimeType)) {
      throw new Error(`Unsupported image type: ${mimeType}. Use JPEG, PNG, WEBP, GIF, HEIC, or HEIF.`);
    }
    if (Buffer.byteLength(data, 'base64') > MAX_IMAGE_BYTES) {
      throw new Error('Image is too large. Choose an image smaller than 20 MB.');
    }
    return {
      inlineData: {
        mimeType,
        data,
      },
    };
  } else if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
    // Fetch image from URL
    const response = await fetch(imageInput);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
    }
    const contentType = (response.headers.get('content-type') || '').split(';')[0].toLowerCase();
    const arrayBuffer = await response.arrayBuffer();
    if (!SUPPORTED_IMAGE_TYPES.has(contentType)) {
      throw new Error('The selected URL did not return a supported image.');
    }
    if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
      throw new Error('Image is too large. Choose an image smaller than 20 MB.');
    }
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    return {
      inlineData: {
        mimeType: contentType.split(';')[0],
        data: base64Data,
      },
    };
  } else {
    // Raw base64 is accepted for API clients that cannot send a data URL.
    if (!imageInput.trim()) {
      throw new Error('Image data is empty');
    }
    if (!/^[A-Za-z0-9+/=\s]+$/.test(imageInput)) {
      throw new Error('Invalid base64 image data');
    }
    if (Buffer.byteLength(imageInput.replace(/\s/g, ''), 'base64') > MAX_IMAGE_BYTES) {
      throw new Error('Image is too large. Choose an image smaller than 20 MB.');
    }
    return {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageInput,
      },
    };
  }
}

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
  });
});

// AI Image Understanding Endpoint
app.post('/api/analyze-image', async (req, res) => {
  const { image, language = 'en' } = req.body;
  const isTamil = language === 'ta';

  try {
    if (typeof image !== 'string' || !image.trim()) {
      return res.status(400).json({ success: false, error: 'Image data is required in request body.' });
    }

    const ai = getGenAI();
    const imagePart = await getImagePart(image);

    const languagePrompt = isTamil
      ? `
CRITICAL LANGUAGE REQUIREMENT:
The user selected TAMIL (தமிழ்).
You MUST generate ALL output strings in simple, sweet, child-friendly TAMIL (தமிழ்).
- headline: in Tamil (format: "<முக்கிய பொருள்> — <குழந்தைகளுக்கான எளிய விளக்கம்>").
- mainSubject: in Tamil (e.g., "யானை", "செடி", "பூனை", "மரம்", "விண்கலம்")
- primaryCategory: in Tamil (e.g., "விலங்குகள்", "தாவரங்கள்", "பொருட்கள்", "மனிதர்கள்", "இடங்கள்", "வடிவங்கள்", "கல்வி உள்ளடக்கம்")
- childDescription: 1-2 simple sentences in child-friendly Tamil
- funFact: a fun educational fact in Tamil
- cartoonCharacter:
  - name: Tamil child-friendly name (e.g. "பர்னபி கரடி", "முளை மலர்", "விண்வெளி வீரர் காஸ்மோ", "டாக்டர் ஸ்பார்க்", "சன்னி ஆசிரியை")
  - role: in Tamil (e.g. "கார்ட்டூன் விலங்கு வழிகாட்டி", "கார்ட்டூன் தாவர நண்பன்", "கார்ட்டூன் விண்வெளி ஆய்வாளர்", "கார்ட்டூன் அறிவியல் தோழன்", "கார்ட்டூன் ஆசிரியர்")
  - explanation: 2-3 lively, simple sentences in child-friendly Tamil spoken directly to a child.
- identified: object and concept names written in Tamil.
- quizQuestions:
  - 2 to 3 simple quiz questions in Tamil based on the image and explanation.
  - question: clear, simple question in Tamil (e.g., "செடிகள் வளர்வதற்கு என்ன தேவை?")
  - options: exactly 3 simple choices in Tamil (e.g., ["தண்ணீர் மற்றும் சூரிய ஒளி", "சாக்லேட்", "விளையாட்டு பொம்மைகள்"])
  - encouragement: cheerful message in Tamil praising the child and explaining why this is correct
`
      : `
LANGUAGE: English
Use simple, clear, child-friendly English suitable for children ages 4-8.
`;

    const promptText = `
You are the AI image understanding brain for EduToon AI, a children's educational app.
Analyze what is present in this image carefully and identify:
1. Objects (toys, vehicles, tools, items, furniture, etc.)
2. Animals (mammals, birds, insects, aquatic life, pets, etc.)
3. Plants (trees, flowers, fruits, vegetables, grass, etc.)
4. People (kids, adults, faces, roles, etc.)
5. Places (park, room, playground, outdoor, beach, school, etc.)
6. Diagrams (drawings, charts, geometric shapes, maps, etc.)
7. Educational content (colors, shapes, numbers, counting, science concepts)
8. Text (any words, letters, signs, labels, or numbers printed or written in the image)

Select an appropriate cartoon character based on the subject:
- Animal subject (mammals, birds, pets, wildlife, aquatic creatures, insects) -> character type 'animal'
- Plant subject (flowers, trees, leaves, gardens, fruits, vegetables) -> character type 'plant'
- Space subject (stars, planets, moon, rockets, cosmos, galaxy) -> character type 'astronaut'
- Science subject (chemistry, magnets, electricity, laboratory, nature experiments, geology, weather) -> character type 'scientist'
- Textbook, books, stationery, classroom, school supplies, learning diagrams, math, or everyday objects -> character type 'teacher'

Generate:
- A short, accurate headline in the format: "<Main Subject> — <child-friendly definition/description>"
- A simple, engaging explanation spoken by this cartoon character suitable for children (2-3 sentences explaining what it is, how it lives or works, or why it is special).
- 2 to 3 simple, fun multiple-choice quiz questions based on the image and explanation for young children.
  Each question should have:
  - id: e.g. "q1", "q2", "q3"
  - question: clear, simple question suitable for children
  - options: exactly 3 simple options
  - correctAnswerIndex: 0, 1, or 2 (zero-based index of the correct option)
  - encouragement: a cheerful, positive message praising the child and explaining why the answer is correct

Also return these teaching-experience fields. They must describe the actual uploaded image, never a made-up subject:
- detectedSubject: the clearest name of the main subject.
- subjectType: one of animal, plant, space, math, science, human-body, vehicle, history, geography, technology, or general.
- characterType: one of animal, plant, astronaut, scientist, or teacher. Select the closest friendly teaching guide for the subject.
- characterName: a playful, fictional name. For animals, make the identified animal the guide (for example, "Tara the Tiger"), not a real person.
- childFriendlyExplanation: 3-5 short sentences in first person when the subject is an animal, plant, vehicle, or space object. Explain key features, how it lives or works, one fun fact, and a gentle safety note when useful. For math, explain the visible problem step by step.
- funFacts: 2 or 3 short facts about the detected subject.
- suggestedVoiceStyle: one of energetic, gentle, adventurous, clear, playful, or curious.

${languagePrompt}
`;

    const response = await retryTransientGeminiRequest(() => ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          imagePart,
          { text: promptText },
        ],
      },
      config: {
        systemInstruction: "You are EduToon AI's child-friendly educational vision analyzer. Always respond with precise, helpful, and safe educational information for young children.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: {
              type: Type.STRING,
              description: "Short headline in the format: '<Main Subject> — <child-friendly definition/description>'. Example: 'Elephant — a large land animal with a trunk, large ears, and four legs.'",
            },
            mainSubject: {
              type: Type.STRING,
              description: "The primary item or subject recognized in the picture.",
            },
            primaryCategory: {
              type: Type.STRING,
              description: "Primary category: 'Animals', 'Objects', 'Plants & Fruits', 'People', 'Places', 'Diagrams & Shapes', 'Educational Content', or 'Text'.",
            },
            childDescription: {
              type: Type.STRING,
              description: "1-2 child-friendly sentences describing what is in the picture.",
            },
            funFact: {
              type: Type.STRING,
              description: "A fun, simple educational fact about the subject for a child.",
            },
            detectedSubject: { type: Type.STRING },
            subjectType: { type: Type.STRING },
            characterType: { type: Type.STRING, description: "One of animal, plant, astronaut, scientist, teacher." },
            characterName: { type: Type.STRING },
            childFriendlyExplanation: { type: Type.STRING },
            funFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedVoiceStyle: { type: Type.STRING },
            cartoonCharacter: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  description: "One of: 'animal', 'plant', 'astronaut', 'scientist', 'teacher'.",
                },
                name: {
                  type: Type.STRING,
                  description: "Playful name for the cartoon character (e.g., 'Barnaby Bear', 'Sprout Blossom', 'Cosmo Astronaut', 'Dr. Spark', 'Miss Sunny').",
                },
                role: {
                  type: Type.STRING,
                  description: "Short role title (e.g. 'Cartoon Animal Guide', 'Cartoon Plant Friend', 'Cartoon Space Explorer', 'Cartoon Science Buddy', 'Cartoon Teacher').",
                },
                explanation: {
                  type: Type.STRING,
                  description: "A simple, lively explanation suitable for children (2-3 sentences) directly explaining the subject in a friendly, conversational way.",
                },
              },
              required: ['type', 'name', 'role', 'explanation'],
            },
            identified: {
              type: Type.OBJECT,
              properties: {
                objects: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specific objects seen.",
                },
                animals: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specific animals seen.",
                },
                plants: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specific plants, fruits, or flowers seen.",
                },
                people: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "People or facial features seen.",
                },
                places: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Settings or places seen.",
                },
                diagrams: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Shapes, patterns, or diagrams seen.",
                },
                educationalContent: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Colors, count, or educational concepts seen.",
                },
                textFound: {
                  type: Type.STRING,
                  description: "Any readable text or words found in the image, or empty string if none.",
                },
              },
              required: ['objects', 'animals', 'plants', 'people', 'places', 'diagrams', 'educationalContent', 'textFound'],
            },
            quizQuestions: {
              type: Type.ARRAY,
              description: "2 to 3 simple multiple-choice questions for children based on the image and explanation.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING, description: "Clear, simple question for children." },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 3 distinct answer options.",
                  },
                  correctAnswerIndex: {
                    type: Type.INTEGER,
                    description: "Zero-based index of the correct answer (0, 1, or 2).",
                  },
                  encouragement: {
                    type: Type.STRING,
                    description: "Cheerful positive message praising the child and explaining why this is correct.",
                  },
                },
                required: ['question', 'options', 'correctAnswerIndex', 'encouragement'],
              },
            },
          },
          required: ['headline', 'mainSubject', 'primaryCategory', 'childDescription', 'funFact', 'detectedSubject', 'subjectType', 'characterType', 'characterName', 'childFriendlyExplanation', 'funFacts', 'suggestedVoiceStyle', 'cartoonCharacter', 'identified', 'quizQuestions'],
        },
      },
    }));

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Gemini returned an empty analysis. Please try the image again.');
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('Gemini returned an invalid analysis response. Please try again.');
    }
    if (!isValidAnalysisResult(parsed)) {
      throw new Error('Gemini returned an incomplete analysis. Please try again.');
    }
    return res.json({ success: true, result: parsed });
  } catch (error: any) {
    const { status: providerStatus, category, message: errorMessage } = getGeminiErrorInfo(error);
    console.error('GEMINI IMAGE ANALYSIS ERROR:', {
      model: GEMINI_MODEL,
      message: errorMessage,
      status: providerStatus,
      category,
      details: error?.errorDetails,
    });
    const status = providerStatus === 400 || providerStatus === 401 || providerStatus === 403 ? 502 : 500;
    return res.status(status).json({
      success: false,
      error: getChildFriendlyAnalysisError(error),
      ...(process.env.NODE_ENV !== 'production' ? { developerMessage: errorMessage, providerStatus, category, model: GEMINI_MODEL } : {}),
    });
  }
});

function isValidAnalysisResult(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  const result = value as Record<string, unknown>;
  const identified = result.identified as Record<string, unknown> | undefined;
  return (
    typeof result.headline === 'string' &&
    typeof result.mainSubject === 'string' &&
    typeof result.primaryCategory === 'string' &&
    typeof result.childDescription === 'string' &&
    typeof result.funFact === 'string' &&
    typeof result.detectedSubject === 'string' &&
    typeof result.subjectType === 'string' &&
    typeof result.characterType === 'string' &&
    typeof result.characterName === 'string' &&
    typeof result.childFriendlyExplanation === 'string' &&
    Array.isArray(result.funFacts) &&
    typeof result.suggestedVoiceStyle === 'string' &&
    Boolean(identified) &&
    typeof identified === 'object' &&
    Array.isArray(result.quizQuestions)
  );
}

// A child can ask a follow-up about the same picture without exposing the API key.
app.post('/api/ask-about-image', async (req, res) => {
  const { image, question, language = 'en', detectedSubject = '', childFriendlyExplanation = '' } = req.body;
  try {
    if (typeof image !== 'string' || !image.trim() || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ success: false, error: 'A picture and question are required.' });
    }
    const ai = getGenAI();
    const imagePart = await getImagePart(image);
    const response = await retryTransientGeminiRequest(() => ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          imagePart,
          {
            text: `You are a friendly fictional EduToon cartoon teacher. A child asked: "${question.trim()}"\n\nThe image was identified as: ${detectedSubject}.\nEarlier explanation: ${childFriendlyExplanation}\n\nAnswer only about this image/topic in ${language === 'ta' ? 'simple Tamil' : 'simple English'} for a child aged 4-8. Use 2-4 short, accurate sentences. Be kind, safe, and do not claim to be a real person.`,
          },
        ],
      },
      config: { systemInstruction: "Give only a child-friendly educational answer. If the question is unrelated to the image, gently guide the child back to what they can see." },
    }));
    const answer = response.text?.trim();
    if (!answer) throw new Error('Gemini returned an empty answer.');
    return res.json({ success: true, answer });
  } catch (error) {
    console.error('GEMINI FOLLOW-UP ERROR:', { model: GEMINI_MODEL, message: getSafeErrorMessage(error) });
    return res.status(502).json({ success: false, error: 'Your cartoon teacher needs a moment. Please try asking again.' });
  }
});

// The default Express parser error is HTML, which made the UI appear to fail silently.
// Keep this JSON so the processing screen can show a useful message.
app.use((error: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: 'Image upload is too large. Choose an image smaller than 20 MB.' });
  }
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ success: false, error: 'The image request could not be read. Please choose the picture again.' });
  }
  return next(error);
});

// Vite middleware setup for full-stack dev and production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduToon AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
