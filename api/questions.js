const cors = require('cors')({ origin: '*' });
const { connectToDatabase, Question } = require('./_db');

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildQuestionQuery(req) {
  const studentEmail = cleanString(req.query.studentEmail).toLowerCase();
  const lessonId = cleanString(req.query.lessonId);
  const status = cleanString(req.query.status);

  const query = {};
  if (studentEmail) query.studentEmail = studentEmail;
  if (lessonId) query.lessonId = lessonId;
  if (status) query.status = status;

  return query;
}

module.exports = async (req, res) => {
  await runMiddleware(req, res, cors);

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const query = buildQuestionQuery(req);
      const limit = Math.min(Number(req.query.limit) || 100, 200);

      const questions = await Question.find(query).sort({ createdAt: -1 }).limit(limit).lean();
      return res.status(200).json({ success: true, questions });
    }

    if (req.method === 'POST') {
      const lessonId = cleanString(req.body.lessonId);
      const lessonTitle = cleanString(req.body.lessonTitle);
      const moduleId = cleanString(req.body.moduleId);
      const moduleTitle = cleanString(req.body.moduleTitle);
      const studentEmail = cleanString(req.body.studentEmail).toLowerCase();
      const studentName = cleanString(req.body.studentName) || studentEmail;
      const question = cleanString(req.body.question);

      if (!lessonId || !lessonTitle || !moduleId || !moduleTitle || !studentEmail || !question) {
        return res.status(400).json({ message: 'Missing required question fields' });
      }

      const savedQuestion = await Question.create({
        lessonId,
        lessonTitle,
        moduleId,
        moduleTitle,
        studentEmail,
        studentName,
        question,
      });

      return res.status(201).json({ success: true, question: savedQuestion });
    }

    if (req.method === 'PATCH') {
      const questionId = cleanString(req.query.id || req.body.id || req.body.questionId);
      const reply = cleanString(req.body.reply);

      if (!questionId || !reply) {
        return res.status(400).json({ message: 'Missing questionId or reply' });
      }

      const updatedQuestion = await Question.findByIdAndUpdate(
        questionId,
        {
          reply,
          status: 'answered',
          answeredAt: new Date(),
        },
        { new: true, runValidators: true },
      ).lean();

      if (!updatedQuestion) {
        return res.status(404).json({ message: 'Question not found' });
      }

      return res.status(200).json({ success: true, question: updatedQuestion });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    console.error('Questions API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Question service failed',
      error: error.message,
    });
  }
};
