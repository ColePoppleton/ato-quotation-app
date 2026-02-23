import mongoose from 'mongoose';

const CourseInstanceSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    deliveryType: { type: String, enum: ['virtual', 'in-person'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    trainerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' }],
    bookings: [{
        delegateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Delegate' },
        quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
        includesBook: { type: Boolean, default: false }
    }]
}, { timestamps: true });

export default mongoose.models.CourseInstance || mongoose.model('CourseInstance', CourseInstanceSchema);