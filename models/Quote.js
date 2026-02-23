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
    financials: {
        basePrice: Number,
        examFees: Number,
        materialsCost: Number,
        totalPrice: Number
    }
}, { timestamps: true });

QuoteSchema.pre('save', function(next) {
    if (this.delegateCount < 5 && this.status === 'draft') {
        this.status = 'pending_approval';
    } else if (this.delegateCount >= 5 && this.status === 'draft') {
        this.status = 'approved';
    }
    next();
});

export default mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);