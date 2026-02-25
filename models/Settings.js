import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    companyName: { type: String, default: 'ATO Engine' },
    primaryColor: { type: String, default: '#2563EB' },
    logoUrl: { type: String, default: '' },
    mileageRate: { type: Number, default: 0.45 },
    // NEW FIELDS
    vatRate: { type: Number, default: 20 },
    defaultMaxEnrollments: { type: Number, default: 12 },
    defaultExamBody: { type: String, default: 'PeopleCert' }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);