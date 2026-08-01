const cors = require('cors')({ origin: '*' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

module.exports = async (req, res) => {
  await runMiddleware(req, res, cors);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const apiKey = process.env.Gemini_API_key;
  if (!apiKey) {
    return res.status(500).json({ message: 'Gemini API key not configured on server' });
  }

  const { model, prompt, coursePrompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Missing prompt' });
  }

  const modelName = model || 'gemini-3.5-flash-lite';
  
  const systemPrompt = "im gemini, if talk not code still to be polite. You are a helpful AI programming tutor.";
  const finalSystemInstruction = coursePrompt 
    ? `${systemPrompt}\n\nAdditional Course Context:\n${coursePrompt}` 
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
      error: error.message,
    });
  }
};
