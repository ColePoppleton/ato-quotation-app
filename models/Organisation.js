import mongoose from 'mongoose';

const OrganisationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    billingAddress: { street: String, city: String, postcode: String },
    contactEmail: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Organisation || mongoose.model('Organisation', OrganisationSchema);