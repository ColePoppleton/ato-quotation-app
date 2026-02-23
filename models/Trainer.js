import mongoose from 'mongoose';

const TrainerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    certifications: [{ type: String }] // e.g., ["ITIL 4", "Prince2"]
}, { timestamps: true });

export default mongoose.models.Trainer || mongoose.model('Trainer', TrainerSchema);