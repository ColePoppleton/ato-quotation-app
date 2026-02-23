import mongoose from 'mongoose';

const CourseInstanceSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    deliveryType: { type: String, enum: ['virtual', 'in-person'], required: true },
    location: { type: String, default: "Virtual/TBD" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    pricePerDelegate: { type: Number, default: 1000 },
    trainerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' }],
    bookedDelegates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Delegate' }],
    attended: { type: Boolean, default: false },
    bookings: [{
        delegateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Delegate' },
        quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
        includesBook: { type: Boolean, default: false }
    }]
}, { timestamps: true });

export default mongoose.models.CourseInstance || mongoose.model('CourseInstance', CourseInstanceSchema);