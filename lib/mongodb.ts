// lib/mongodb.ts
import mongoose from 'mongoose';

// 🛑 TEMPORARY FIX: Paste the exact string that worked in test-db.js right here
const MONGODB_URI = "mongodb+srv://Test:Test@brightoak.zw9blrn.mongodb.net/ato_management?retryWrites=true&w=majority";

if (!MONGODB_URI || MONGODB_URI === 'undefined') {
    throw new Error('❌ MONGODB_URI is missing or undefined!');
}

// Properly initialize the global cache for Next.js hot-reloads
let cached = (global as any).mongoose;
if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
    console.log("⚡ dbConnect function triggered!");

    if (cached.conn) {
        console.log("✅ Using existing cached database connection.");
        return cached.conn;
    }

    if (!cached.promise) {
        console.log("⏳ Establishing NEW database connection...");

        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log("🚀 Mongoose successfully connected to Atlas!");
            return mongoose;
        }).catch(err => {
            console.error("❌ Mongoose connection completely failed:", err.message);
            cached.promise = null;
            throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}