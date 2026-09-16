import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { analyzeImage, askAboutImage, safeErrorMessage, toApiError } from './api/_lib/gemini';

const serverDirectory = process.cwd();
dotenv.config({ path: path.join(serverDirectory, '.env.local') });
dotenv.config({ path: path.join(serverDirectory, '.env') });

const app = express();
const PORT = 3000;
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

function sendJson(res: express.Response, status: number, body: Record<string, unknown>) {
  console.info('API RESPONSE', { route: res.req.path, status, success: body.success === true });
  return res.status(status).json(body);
}

app.get('/api/health', (_req, res) => {
  sendJson(res, 200, {
    status: 'ok',
    time: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
  });
});

app.post('/api/analyze-image', async (req, res) => {
  console.info('API REQUEST RECEIVED', { route: req.path, method: req.method });
  try {
    const { image, language = 'en' } = req.body;
    if (typeof image !== 'string' || !image.trim()) {
      return sendJson(res, 400, { success: false, error: 'Image data is required in request body.', code: 'INVALID_REQUEST' });
    }
    const result = await analyzeImage(image, typeof language === 'string' ? language : 'en');
    return sendJson(res, 200, { success: true, result, ...result });
  } catch (error) {
    const normalized = toApiError(error);
    console.error('API ERROR', { status: normalized.status, code: normalized.code, message: safeErrorMessage(normalized) });
    return sendJson(res, normalized.status, { success: false, error: normalized.message, code: normalized.code });
  }
});

app.post('/api/ask-about-image', async (req, res) => {
  console.info('API REQUEST RECEIVED', { route: req.path, method: req.method });
  try {
    const { image, question, language = 'en', detectedSubject = '', childFriendlyExplanation = '' } = req.body;
    if (typeof image !== 'string' || !image.trim() || typeof question !== 'string' || !question.trim()) {
      return sendJson(res, 400, { success: false, error: 'A picture and question are required.', code: 'INVALID_REQUEST' });
    }
    const answer = await askAboutImage(image, question, language, detectedSubject, childFriendlyExplanation);
    return sendJson(res, 200, { success: true, answer });
  } catch (error) {
    const normalized = toApiError(error);
    console.error('API ERROR', { status: normalized.status, code: normalized.code, message: safeErrorMessage(normalized) });
    return sendJson(res, normalized.status, { success: false, error: normalized.message, code: normalized.code });
  }
});

app.use((error: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error?.type === 'entity.too.large') {
    return sendJson(res, 413, { success: false, error: 'Image upload is too large. Choose an image smaller than 20 MB.', code: 'INVALID_IMAGE' });
  }
  if (error instanceof SyntaxError && 'body' in error) {
    return sendJson(res, 400, { success: false, error: 'The image request could not be read. Please choose the picture again.', code: 'INVALID_REQUEST' });
  }
  if (res.headersSent) return next(error);
  console.error('API UNEXPECTED ERROR', { message: safeErrorMessage(error) });
  return sendJson(res, 500, { success: false, error: 'The image analysis service encountered an unexpected error. Please try again.', code: 'INTERNAL_SERVER_ERROR' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`EduToon AI Server running on http://localhost:${PORT}`));
}

if (!process.env.VERCEL) startServer();

export default app;
