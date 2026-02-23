"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function CourseRoster() {
    const { id } = useParams();
    const [instance, setInstance] = useState<any>(null);
    const [delegates, setDelegates] = useState<any[]>([]);
    const [selectedDelegate, setSelectedDelegate] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resI, resD] = await Promise.all([
                    fetch(`/api/course-instances/${id}`),
                    fetch(`/api/delegates`)
                ]);

                if (!resI.ok || !resD.ok) {
                    throw new Error("Failed to fetch roster data");
                }

                const iData = await resI.json();
                const dData = await resD.json();

                setInstance(iData.data);
                setDelegates(dData.data);
            } catch (err) {
                console.error("Roster Load Error:", err);
            }
        };

        if (id) fetchData();
    }, [id]);

    const addDelegate = async () => {
        await fetch(`/api/course-instances/${id}/book`, {
            method: 'POST',
            body: JSON.stringify({ delegateId: selectedDelegate })
        });
        window.location.reload();
    };

    const toggleAttendance = async (delegateId: string, attended: boolean) => {
        await fetch(`/api/course-instances/${id}/attendance`, {
            method: 'PATCH',
            body: JSON.stringify({ delegateId, attended })
        });
    };

    const removeDelegate = async (bookingId: string) => {
        if (!confirm("Remove this delegate from the roster?")) return;

        await fetch(`/api/course-instances/${id}/bookings/${bookingId}`, {
            method: 'DELETE'
        });
        window.location.reload();
    };

    if (!instance) return <p className="p-10">Loading Roster...</p>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-black">Roster: {instance.courseId?.title}</h1>

            {/* Booking Section */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-bold mb-2">Assign Delegate</label>
                    <select value={selectedDelegate} onChange={(e) => setSelectedDelegate(e.target.value)} className="w-full border p-2 rounded-lg">
                        <option value="">Select a Delegate...</option>
                        {delegates.map(d => <option key={d._id} value={d._id}>{d.firstName} {d.lastName} ({d.organisationId?.name})</option>)}
                    </select>
                </div>
                <button onClick={addDelegate} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Book</button>
            </div>

            {/* Attendance List */}
            <div className="bg-white border rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Organisation</th>
                        <th className="px-6 py-4">Attendance</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {instance.bookings.map((b: any) => (
                        // Use the booking ID (b._id) instead of the delegate ID for the key
                        <tr key={b._id}>
                            <td className="px-6 py-4 font-bold">{b.delegateId.firstName} {b.delegateId.lastName}</td>
                            <td className="px-6 py-4">{b.delegateId.organisationId?.name}</td>
                            <td className="px-6 py-4">
                                <input
                                    type="checkbox"
                                    defaultChecked={b.attended}
                                    onChange={(e) => toggleAttendance(b.delegateId._id, e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600"
                                />
                            </td>
                            {/* ADD THIS: Remove Button Cell */}
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => removeDelegate(b._id)}
                                    className="text-red-500 hover:text-red-700 font-bold"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}