import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    examBody: { type: String, required: true },
    requiresExam: { type: Boolean, default: true },
    // Changed to match frontend property expectations
    materialsCost: { type: Number, default: 0 },
    take2Cost: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);