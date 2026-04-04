const { OAuth2Client } = require('google-auth-library');
const { connectToDatabase, User } = require('./_db');
const cors = require('cors')({ origin: '*' });

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

module.exports = async (req, res) => {
  await runMiddleware(req, res, cors);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'Missing credential' });
  }

  try {
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.Client_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    await connectToDatabase();

    // Check if user exists or update
    let user = await User.findOne({ googleId });
    if (!user) {
        user = await User.create({ googleId, email, name });
    } else {
        user.lastLoginAt = new Date();
        await user.save();
    }

    const totalVisits = await User.countDocuments();

    return res.status(200).json({ 
      success: true, 
      user: { name, email, googleId },
      totalVisits
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(401).json({ success: false, message: 'Invalid token', errorDetials: error.message, stack: error.stack });
  }
};
