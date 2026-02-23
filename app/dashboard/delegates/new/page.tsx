"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define the shape of your Organisation data for TypeScript
interface Organisation {
    _id: string;
    name: string;
}

export default function NewDelegatePage() {
    const router = useRouter();

    // Form State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [selectedOrgId, setSelectedOrgId] = useState("");

    // Data Fetching State
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

    // Submission State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch Organisations when the page loads
    useEffect(() => {
        const fetchOrganisations = async () => {
            try {
                const response = await fetch('/api/organisations');
                if (!response.ok) throw new Error("Failed to load organisations");

                const result = await response.json();
                if (result.success) {
                    setOrganisations(result.data);
                }
            } catch (err) {
                console.error("Error fetching organisations:", err);
                setError("Failed to load the organisation list.");
            } finally {
                setIsLoadingOrgs(false);
            }
        };

        fetchOrganisations();
    }, []);

    const handleCreateDelegate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrgId) {
            setError("Please select an organisation for this delegate.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/delegates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    organisationId: selectedOrgId
                }),
            });

            if (!response.ok) throw new Error("Failed to add delegate");

            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-10 shadow-sm">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Log New Delegate</h2>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>}

            <form onSubmit={handleCreateDelegate} className="space-y-6">

                {/* Real Database Dropdown for Organisation */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Corporate Client (Organisation)</label>
                    <select
                        required
                        value={selectedOrgId}
                        onChange={(e) => setSelectedOrgId(e.target.value)}
                        disabled={isLoadingOrgs}
                        className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                    >
                        <option value="" disabled>
                            {isLoadingOrgs ? "Loading organisations..." : "Select an Organisation"}
                        </option>
                        {organisations.map((org) => (
                            <option key={org._id} value={org._id}>
                                {org.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                        <input required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border p-3 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                        <input required type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border p-3 rounded-lg" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Corporate Email</label>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-3 rounded-lg" />
                </div>

                <button type="submit" disabled={isSubmitting || isLoadingOrgs} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-8 transition-all hover:bg-blue-700 disabled:opacity-50">
                    {isSubmitting ? "Saving..." : "Log Delegate"}
                </button>
            </form>
        </div>
    );
}