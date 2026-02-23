"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Organisation { _id: string; name: string; }
interface CourseInstance { _id: string; courseId: { title: string }; startDate: string; deliveryType: string; }

export default function NewQuotePage() {
    const router = useRouter();

    // Form State
    const [selectedOrgId, setSelectedOrgId] = useState("");
    const [selectedInstanceId, setSelectedInstanceId] = useState("");
    const [delegateCount, setDelegateCount] = useState(1);
    const [includesExam, setIncludesExam] = useState(true);

    // Data State
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [instances, setInstances] = useState<CourseInstance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both dependencies at the same time
                const [orgRes, instRes] = await Promise.all([
                    fetch('/api/organisations'),
                    fetch('/api/course-instances')
                ]);

                if (!orgRes.ok || !instRes.ok) throw new Error("Failed to load required data");

                const orgData = await orgRes.json();
                const instData = await instRes.json();

                if (orgData.success) setOrganisations(orgData.data);
                if (instData.success) setInstances(instData.data);
            } catch (err) {
                setError("Failed to load dropdown data from the database.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCreateQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrgId || !selectedInstanceId) {
            setError("Please select both a client and a course instance.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organisationId: selectedOrgId,
                    courseInstanceId: selectedInstanceId,
                    delegateCount,
                    includesExam
                }),
            });

            if (!response.ok) throw new Error("Failed to generate quote");
            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-10 shadow-sm">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Generate New Quote</h2>

            {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>}

            <form onSubmit={handleCreateQuote} className="space-y-6">

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Corporate Client</label>
                    <select required value={selectedOrgId} onChange={(e) => setSelectedOrgId(e.target.value)} disabled={isLoading} className="w-full border p-3 rounded-lg bg-gray-50">
                        <option value="" disabled>{isLoading ? "Loading..." : "Select Client"}</option>
                        {organisations.map(org => <option key={org._id} value={org._id}>{org.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Course Instance</label>
                    <select required value={selectedInstanceId} onChange={(e) => setSelectedInstanceId(e.target.value)} disabled={isLoading} className="w-full border p-3 rounded-lg bg-gray-50">
                        <option value="" disabled>{isLoading ? "Loading..." : "Select Course Date"}</option>
                        {instances.map(inst => (
                            <option key={inst._id} value={inst._id}>
                                {inst.courseId?.title || "Course"} - {new Date(inst.startDate).toLocaleDateString()} ({inst.deliveryType})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Number of Delegates</label>
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => setDelegateCount(Math.max(1, delegateCount - 1))} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition-colors">-</button>
                        <span className="text-2xl font-black w-8 text-center">{delegateCount}</span>
                        <button type="button" onClick={() => setDelegateCount(delegateCount + 1)} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition-colors">+</button>
                    </div>

                    {delegateCount < 5 && (
                        <p className="text-sm text-amber-600 font-medium bg-amber-50 p-3 rounded-lg border border-amber-200">
                            ⚠️ Warning: Quotes with fewer than 5 delegates will require managerial approval.
                        </p>
                    )}
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                        <input type="checkbox" checked={includesExam} onChange={(e) => setIncludesExam(e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                        <div>
                            <p className="font-semibold text-gray-900">Include Certification Exam</p>
                            <p className="text-sm text-gray-500">Exams are typically mandatory for certification tracks.</p>
                        </div>
                    </label>
                </div>

                <hr className="border-gray-100" />

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? "Generating Document..." : "Generate Official Quote"}
                </button>
            </form>
        </div>
    );
}