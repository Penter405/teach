const { OAuth2Client } = require('google-auth-library');
const { connectToDatabase, Question } = require('./_db');
const cors = require('cors')({
  origin: [
    'https://penter405.github.io',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ]
});

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.Client_ID;
const oauth2Client = new OAuth2Client(CLIENT_ID);

const TEACHER_EMAILS = (process.env.TEACHER_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

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

/**
 * Verify the Google ID Token from the Authorization header.
 * Returns { email, name } on success, or null if invalid.
 */
async function verifyAuth(req) {
    // Support both Authorization header and body credential
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.body && req.body.credential) {
        token = req.body.credential;
    }

    if (!token) return null;

    try {
        const ticket = await oauth2Client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return { email: payload.email, name: payload.name || '' };
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return null;
    }
}

function withMessages(question) {
    if (!question) return question;
    const obj = question.toObject ? question.toObject() : question;
    const messages = Array.isArray(obj.messages) ? [...obj.messages] : [];
    if (messages.length === 0 && obj.question) {
        messages.push({ role: 'student', text: obj.question, createdAt: obj.createdAt });
    }
    if (messages.length === 1 && obj.reply) {
        messages.push({ role: 'teacher', text: obj.reply, createdAt: obj.answeredAt || obj.updatedAt });
    }
    return { ...obj, messages };
}

module.exports = async (req, res) => {
    await runMiddleware(req, res, cors);

    try {
        // Verify authentication for all non-OPTIONS requests
        const user = await verifyAuth(req);
        if (!user) {
            return res.status(401).json({ success: false, error: '請先登入' });
        }

        const isTeacher = TEACHER_EMAILS.includes(user.email.toLowerCase());

        await connectToDatabase();

        if (req.method === 'GET') {
            const query = {};

            // Students can only see their own questions; teachers can see all
            if (!isTeacher) {
                query.studentEmail = user.email.toLowerCase();
            } else {
                const studentEmail = cleanString(req.query.studentEmail).toLowerCase();
                if (studentEmail) query.studentEmail = studentEmail;
            }

            const lessonId = cleanString(req.query.lessonId);
            const status = cleanString(req.query.status);
            if (lessonId) query.lessonId = lessonId;
            if (status) query.status = status;

            const limit = Math.min(Number(req.query.limit) || 100, 200);
            const questions = await Question.find(query).sort({ updatedAt: -1 }).limit(limit).lean();
            return res.status(200).json({ success: true, questions: questions.map(withMessages) });
        }

        if (req.method === 'POST') {
            const savedQuestion = await Question.create({
                lessonId: cleanString(req.body.lessonId),
                lessonTitle: cleanString(req.body.lessonTitle),
                moduleId: cleanString(req.body.moduleId),
                moduleTitle: cleanString(req.body.moduleTitle),
                studentEmail: user.email.toLowerCase(),  // From verified token
                studentName: user.name || user.email.toLowerCase(),
                question: cleanString(req.body.question),
                messages: [{ role: 'student', text: cleanString(req.body.question) }],
            });
            return res.status(201).json({ success: true, question: withMessages(savedQuestion) });
        }

        if (req.method === 'PATCH') {
            const questionId = cleanString(req.query.id || req.body.id || req.body.questionId);
            const action = cleanString(req.body.action);
            const text = cleanString(req.body.message || req.body.text || req.body.reply);

            if (!questionId) return res.status(400).json({ message: 'Missing questionId' });

            const currentQuestion = await Question.findById(questionId);
            if (!currentQuestion) return res.status(404).json({ message: 'Question not found' });

            if (action === 'close') {
                // Only teachers or the question owner can close
                if (!isTeacher && currentQuestion.studentEmail !== user.email.toLowerCase()) {
                    return res.status(403).json({ error: '無權限關閉此問題' });
                }
                currentQuestion.status = 'closed';
                currentQuestion.closedBy = isTeacher ? 'teacher' : 'student';
                currentQuestion.closedAt = new Date();
                await currentQuestion.save();
                return res.status(200).json({ success: true, question: withMessages(currentQuestion) });
            }

            if (currentQuestion.status === 'closed') {
                return res.status(409).json({ message: 'This chat is closed.' });
            }

            if (!text) return res.status(400).json({ message: 'Missing message text' });

            // Determine role from verified identity, not from request body
            const role = isTeacher ? 'teacher' : 'student';

            // Students can only reply to their own questions
            if (!isTeacher && currentQuestion.studentEmail !== user.email.toLowerCase()) {
                return res.status(403).json({ error: '無權限回覆此問題' });
            }

            currentQuestion.messages.push({ role, text });
            if (role === 'teacher') {
                currentQuestion.reply = text;
                currentQuestion.answeredAt = new Date();
            }
            await currentQuestion.save();
            return res.status(200).json({ success: true, question: withMessages(currentQuestion) });
        }

        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error('questions error:', error);
        return res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
};
