"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTrainerPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [certifications, setCertifications] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateTrainer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Convert comma-separated string into an array
        const certArray = certifications.split(",").map(cert => cert.trim()).filter(Boolean);

        try {
            const response = await fetch('/api/trainers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, certifications: certArray }),
            });

            if (!response.ok) throw new Error("Failed to add trainer");

            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-10 shadow-sm">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Register Instructor</h2>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>}

            <form onSubmit={handleCreateTrainer} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-3 rounded-lg" />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-3 rounded-lg" />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Certifications (Comma separated)</label>
                    <input type="text" value={certifications} onChange={(e) => setCertifications(e.target.value)} className="w-full border p-3 rounded-lg" placeholder="ITIL 4, PRINCE2 Agile" />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-8">
                    {isSubmitting ? "Saving..." : "Register Trainer"}
                </button>
            </form>
        </div>
    );
}