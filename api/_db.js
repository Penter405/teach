const mongoose = require('mongoose');

let isConnected = false;

async function connectToDatabase() {
    if (isConnected) {
        return;
    }
    try {
        const uri = process.env.MongoDB;
        if (!uri) throw new Error("Missing MongoDB connection string");
        
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
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

module.exports = { connectToDatabase, User };
