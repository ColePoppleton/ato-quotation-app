"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCoursePage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [examBody, setExamBody] = useState("PeopleCert");
    const [requiresExam, setRequiresExam] = useState(true);
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
                body: JSON.stringify({ title, examBody, requiresExam }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create course");
            }

            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-10 shadow-sm">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Add New Course to Catalog</h2>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>}

            <form onSubmit={handleCreateCourse} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title</label>
                    <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-3 rounded-lg" placeholder="e.g., ITIL 4 Foundation" />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Body</label>
                    <select value={examBody} onChange={(e) => setExamBody(e.target.value)} className="w-full border p-3 rounded-lg">
                        <option value="PeopleCert">PeopleCert</option>
                        <option value="EXIN">EXIN</option>
                        <option value="APMG">APMG</option>
                    </select>
                </div>

                <label className="flex items-center gap-3 mt-4">
                    <input type="checkbox" checked={requiresExam} onChange={(e) => setRequiresExam(e.target.checked)} className="w-5 h-5" />
                    <span className="font-semibold text-gray-900">Mandatory Exam Requirement</span>
                </label>

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-8">
                    {isSubmitting ? "Saving..." : "Save Course"}
                </button>
            </form>
        </div>
    );
}