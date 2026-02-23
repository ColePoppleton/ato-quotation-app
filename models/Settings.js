import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    companyName: { type: String, default: 'Your ATO Training Co.' },
    companyAddress: { type: String, default: '123 Business Park, London, UK' },
    primaryColor: { type: String, default: '#2563EB' },
    logoUrl: { type: String, default: '' },
    mileageRate: { type: Number, default: 0.45 }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);