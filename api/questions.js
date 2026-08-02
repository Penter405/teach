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

function withMessages(question) {
  if (!question) return question;

  const messages = Array.isArray(question.messages) ? [...question.messages] : [];

  if (messages.length === 0 && question.question) {
    messages.push({
      role: 'student',
      text: question.question,
      createdAt: question.createdAt,
    });
  }

  if (messages.length === 1 && question.reply) {
    messages.push({
      role: 'teacher',
      text: question.reply,
      createdAt: question.answeredAt || question.updatedAt,
    });
  }

  return {
    ...question,
    messages,
  };
}

module.exports = async (req, res) => {
  await runMiddleware(req, res, cors);

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const query = buildQuestionQuery(req);
      const limit = Math.min(Number(req.query.limit) || 100, 200);

      const questions = await Question.find(query).sort({ updatedAt: -1 }).limit(limit).lean();
      return res.status(200).json({ success: true, questions: questions.map(withMessages) });
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
        messages: [{ role: 'student', text: question }],
      });

      return res.status(201).json({ success: true, question: withMessages(savedQuestion.toObject()) });
    }

    if (req.method === 'PATCH') {
      const questionId = cleanString(req.query.id || req.body.id || req.body.questionId);
      const action = cleanString(req.body.action);
      const role = cleanString(req.body.role) === 'student' ? 'student' : 'teacher';
      const text = cleanString(req.body.message || req.body.text || req.body.reply);

      if (!questionId) {
        return res.status(400).json({ message: 'Missing questionId' });
      }

      const currentQuestion = await Question.findById(questionId);
      if (!currentQuestion) {
        return res.status(404).json({ message: 'Question not found' });
      }

      if (action === 'close') {
        const closedBy = cleanString(req.body.closedBy) === 'student' ? 'student' : 'teacher';
        currentQuestion.status = 'closed';
        currentQuestion.closedBy = closedBy;
        currentQuestion.closedAt = new Date();
        await currentQuestion.save();
        return res.status(200).json({ success: true, question: withMessages(currentQuestion.toObject()) });
      }

      if (currentQuestion.status === 'closed') {
        return res.status(409).json({ message: 'This chat is closed. Please reask to start a new chat.' });
      }

      if (!text) {
        return res.status(400).json({ message: 'Missing message text' });
      }

      currentQuestion.messages.push({ role, text });
      if (role === 'teacher') {
        currentQuestion.reply = text;
        currentQuestion.answeredAt = new Date();
      }
      await currentQuestion.save();

      return res.status(200).json({ success: true, question: withMessages(currentQuestion.toObject()) });
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
