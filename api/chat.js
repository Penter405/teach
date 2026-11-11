const { OAuth2Client } = require('google-auth-library');
const cors = require('cors')({
  origin: [
    'https://penter405.github.io',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ]
});
const { GoogleGenerativeAI } = require('@google/generative-ai');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.Client_ID;
const oauth2Client = new OAuth2Client(CLIENT_ID);

// Only these models may be requested by the client (prevents picking expensive models)
const ALLOWED_MODELS = ['gemini-3.5-flash-lite'];
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const MAX_PROMPT_CHARS = 20000;
const MAX_COURSE_PROMPT_CHARS = 8000;

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

/**
 * Verify the Google ID Token from `Authorization: Bearer <token>`.
 * Guests have no Google token, so they are rejected here.
 * Mirrors login.js: only verified @gmail.com accounts are allowed.
 */
async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  if (!token) return null;

  try {
    const ticket = await oauth2Client.verifyIdToken({ idToken: token, audience: CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || payload.email_verified !== true || typeof payload.email !== 'string') return null;
    if (!payload.email.trim().toLowerCase().endsWith('@gmail.com')) return null;
    return { email: payload.email };
  } catch (err) {
    console.warn('[chat] Token verification failed:', err.message);
    return null;
  }
}

module.exports = async (req, res) => {
  await runMiddleware(req, res, cors);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Guests (no valid Google sign-in) cannot use the AI
  const user = await verifyAuth(req);
  if (!user) {
    return res.status(401).json({ success: false, message: '請先使用 Google 帳號登入才能使用 AI 助教' });
  }

  const apiKey = process.env.Gemini_API_key;
  if (!apiKey) {
    console.error('[chat] Gemini API key not configured');
    return res.status(500).json({ success: false, message: '服務暫時不可用' });
  }

  const { model, prompt, coursePrompt } = req.body || {};

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ success: false, message: 'Missing prompt' });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return res.status(400).json({ success: false, message: '對話太長，請按重新開始後再提問' });
  }
  if (coursePrompt !== undefined && coursePrompt !== null && typeof coursePrompt !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid coursePrompt' });
  }

  const modelName = ALLOWED_MODELS.includes(model) ? model : DEFAULT_MODEL;

  const systemPrompt = "im gemini, if talk not code still to be polite. You are a helpful AI programming tutor.";
  const safeCoursePrompt = (coursePrompt || '').slice(0, MAX_COURSE_PROMPT_CHARS);
  const finalSystemInstruction = safeCoursePrompt
    ? `${systemPrompt}\n\nAdditional Course Context:\n${safeCoursePrompt}`
    : systemPrompt;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: finalSystemInstruction
    });

    const result = await genModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return res.status(200).json({
      success: true,
      model: modelName,
      text: text,
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gemini API call failed',
      error: '服務暫時不可用',
    });
  }
};
