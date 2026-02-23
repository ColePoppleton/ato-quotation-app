import mongoose from 'mongoose';

const QuoteSchema = new mongoose.Schema({
    organisationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organisation',
        required: true
    },
    courseInstanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseInstance',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'pending_approval', 'approved', 'sent'],
        default: 'draft'
    },
    delegateCount: {
        type: Number,
        required: true,
        min: [1, 'Must have at least 1 delegate']
    },
    includesExam: {
        type: Boolean,
        default: true
    },
    financials: {
        basePrice: { type: Number, default: 0 },
        examFees: { type: Number, default: 0 },
        travelCost: { type: Number, default: 0 },
        accommodationCost: { type: Number, default: 0 },
        totalPrice: { type: Number, default: 0 }
    }
}, { timestamps: true });


export default mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);