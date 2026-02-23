"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCoursePage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [examBody, setExamBody] = useState("PeopleCert");
    const [requiresExam, setRequiresExam] = useState(true);
    // New Fields
    const [materialsCost, setMaterialsCost] = useState(25.00);
    const [take2Cost, setTake2Cost] = useState(50.00);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    examBody,
                    requiresExam,
                    materialsCost: Number(materialsCost),
                    take2Cost: Number(take2Cost)
                }),
            });

            if (!response.ok) throw new Error("Failed to create course");
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-10 shadow-sm">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Add New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title</label>
                    <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-3 rounded-lg" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Book/Materials Price (£)</label>
                        <input type="number" step="0.01" value={materialsCost} onChange={(e) => setMaterialsCost(Number(e.target.value))} className="w-full border p-3 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Take 2 Voucher Price (£)</label>
                        <input type="number" step="0.01" value={take2Cost} onChange={(e) => setTake2Cost(Number(e.target.value))} className="w-full border p-3 rounded-lg" />
                    </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-8">
                    {isSubmitting ? "Saving..." : "Save Course"}
                </button>
            </form>
        </div>
    );
}