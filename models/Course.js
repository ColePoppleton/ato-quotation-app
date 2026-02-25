import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    examBody: { type: String, required: true, default: 'PeopleCert' },

    // Financials
    costPerEnrollment: { type: Number, default: 0 }, // Base tuition price
    materialsCost: { type: Number, default: 0 },    // Cost of books/manuals
    take2Cost: { type: Number, default: 0 },       // Cost of "Take 2" resit voucher

    // Exam Logic
    requiresExam: { type: Boolean, default: true },
    examCost: { type: Number, default: 0 },         // Cost of the voucher itself

    // Constraints
    maxEnrollments: { type: Number, default: 12 },   // Default room/virtual cap
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);