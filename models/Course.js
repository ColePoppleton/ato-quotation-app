import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    examBody: { type: String, required: true },
    materials: [{ name: String, price: Number }],
    requiresExam: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);