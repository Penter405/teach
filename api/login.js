const { OAuth2Client } = require('google-auth-library');
const { connectToDatabase, User } = require('./_db');
const cors = require('cors')({
  origin: [
    'https://penter405.github.io',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ]
});

// Helper to run cors middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

// Ensure the client ID matches your Vercel env variable names
const client = new OAuth2Client(process.env.Client_ID);
const allowedGoogleDomain = 'gmail.com';

function isAllowedGoogleEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail.endsWith(`@${allowedGoogleDomain}`);
}

module.exports = async (req, res) => {
  await runMiddleware(req, res, cors);

  // GET = warm-up ping sent when the login page opens. It starts this function and
  // opens the database connection early, so the real POST sign-in is fast.
  if (req.method === 'GET') {
    try {
      await connectToDatabase();
    } catch (e) {
      // ignore – the POST will report real errors
    }
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'Missing credential' });
  }

  try {
    // Verify the Google token and connect to the database at the same time.
    const [ticket] = await Promise.all([
      client.verifyIdToken({
        idToken: credential,
        audience: process.env.Client_ID,
      }),
      connectToDatabase(),
    ]);
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Only allow verified personal Gmail accounts to sign in.
    if (!payload.email_verified || !isAllowedGoogleEmail(email)) {
      return res.status(403).json({
        success: false,
        message: 'Only verified @gmail.com accounts are allowed.',
      });
    }

    // Create the user or update lastLoginAt in a single database round trip.
    await User.updateOne(
      { googleId },
      { $set: { lastLoginAt: new Date() }, $setOnInsert: { email, name } },
      { upsert: true }
    );

    // Reads collection metadata instead of counting every document.
    const totalVisits = await User.estimatedDocumentCount();

    return res.status(200).json({ 
      success: true, 
      user: { name, email, googleId },
      totalVisits
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: '登入失敗' });
  }
};
