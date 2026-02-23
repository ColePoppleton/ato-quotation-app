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
    delegates: [{
        firstName: String,
        lastName: String,
        email: String,
        wantsMaterials: { type: Boolean, default: false },
        wantsTake2: { type: Boolean, default: false }
    }],
    delegateCount: { type: Number, default: 1 },
    includesExam: {
        type: Boolean,
        default: true
    },
    financials: {
        basePrice: { type: Number, default: 0 },
        examFees: { type: Number, default: 0 },
        travelCost: { type: Number, default: 0 },
        accommodationCost: { type: Number, default: 0 },
        trainingMaterialsCost: { type: Number, default: 0 },
        take2Cost: { type: Number, default: 0 },
        totalPrice: { type: Number, default: 0 }
    }
}, { timestamps: true });


export default mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);