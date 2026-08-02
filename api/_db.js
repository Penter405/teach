const mongoose = require('mongoose');

let isConnected = false;

async function connectToDatabase() {
    if (isConnected) {
        return;
    }
    try {
        const uri = process.env.MongoDB;
        if (!uri) throw new Error("Missing MongoDB connection string");
        
        await mongoose.connect(uri);
        isConnected = true;
    } catch (error) {
        console.error("Database connection failed", error);
        throw error;
    }
}

const UserSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    lastLoginAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const QuestionSchema = new mongoose.Schema({
    lessonId: { type: String, required: true, index: true },
    lessonTitle: { type: String, required: true },
    moduleId: { type: String, required: true, index: true },
    moduleTitle: { type: String, required: true },
    studentEmail: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    question: { type: String, required: true },
    reply: { type: String, default: '' },
    status: { type: String, enum: ['open', 'answered'], default: 'open', index: true },
    answeredAt: { type: Date, default: null },
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

module.exports = { connectToDatabase, User, Question };
