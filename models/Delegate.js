import mongoose from 'mongoose';

const DelegateSchema = new mongoose.Schema({
    organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Delegate || mongoose.model('Delegate', DelegateSchema);