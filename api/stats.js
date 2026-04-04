const { connectToDatabase, User } = require('./_db');
const cors = require('cors')({ origin: '*' });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result)
      return resolve(result)
    })
  })
}

module.exports = async (req, res) => {
  await runMiddleware(req, res, cors);

  try {
    await connectToDatabase();
    const count = await User.countDocuments();
    return res.status(200).json({ count });
  } catch (error) {
    console.error('Stats Error:', error);
    return res.status(500).json({ count: 0, message: 'Error retrieving stats' });
  }
};
