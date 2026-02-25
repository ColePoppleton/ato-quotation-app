import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    examBody: { type: String, required: true, default: 'PeopleCert' },
    requiresExam: { type: Boolean, default: true },

    // Financial Fields
    costPerEnrollment: { type: Number, default: 0 }, // Tuition price
    materialsCost: { type: Number, default: 0 },
    take2Cost: { type: Number, default: 0 },
    examCost: { type: Number, default: 0 },

    // Operational Fields
    maxEnrollments: { type: Number, default: 12 }
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);