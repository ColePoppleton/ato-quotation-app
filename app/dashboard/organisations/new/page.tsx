"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewOrganisationPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [postcode, setPostcode] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateOrganisation = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/organisations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    contactEmail,
                    billingAddress: { street, city, postcode }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add client organisation");
            }

            // Route back to the dashboard upon success
            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-10 shadow-sm">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Register Corporate Client</h2>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl font-medium">{error}</div>}

            <form onSubmit={handleCreateOrganisation} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                        <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Vodafone" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Contact Email</label>
                        <input required type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="billing@company.com" />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Billing Address</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                            <input required type="text" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                <input required type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Postcode / Zip</label>
                                <input required type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-8 transition-all hover:bg-blue-700 disabled:opacity-50">
                    {isSubmitting ? "Saving Client..." : "Register Client"}
                </button>
            </form>
        </div>
    );
}