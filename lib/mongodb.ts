import mongoose from 'mongoose';
// Explicitly import models to ensure they register their schemas
import "@/models/Quote";
import "@/models/Organisation";
import "@/models/Delegate";
import "@/models/CourseInstance";
import "@/models/Trainer";
import "@/models/Course";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (global as any).mongoose || { conn: null, promise: null };
if (!(global as any).mongoose) (global as any).mongoose = cached;

export async function dbConnect() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI!).then((mongoose) => mongoose);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}