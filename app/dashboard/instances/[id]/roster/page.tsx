"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CourseRoster() {
    const { id } = useParams();
    const [instance, setInstance] = useState<any>(null);
    const [delegates, setDelegates] = useState<any[]>([]);
    const [directorySearch, setDirectorySearch] = useState("");
    const [selectedDelegate, setSelectedDelegate] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resI, resD] = await Promise.all([
                    fetch(`/api/course-instances/${id}`),
                    fetch(`/api/delegates`)
                ]);
                const iData = await resI.json();
                const dData = await resD.json();
                setInstance(iData.data);
                setDelegates(dData.data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        if (id) fetchData();
    }, [id]);

    // Directory Search Logic
    const filteredDirectory = useMemo(() => {
        if (!directorySearch) return delegates.slice(0, 50); // Performance limit
        return delegates.filter(d =>
            `${d.firstName} ${d.lastName} ${d.organisationId?.name || ''}`
                .toLowerCase().includes(directorySearch.toLowerCase())
        );
    }, [directorySearch, delegates]);

    const toggleAttendance = async (delegateId: string, currentStatus: boolean) => {
        const updatedBookings = instance.bookings.map((b: any) =>
            b.delegateId._id === delegateId ? { ...b, attended: !currentStatus } : b
        );
        setInstance({ ...instance, bookings: updatedBookings });
        await fetch(`/api/course-instances/${id}/attendance`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delegateId, attended: !currentStatus })
        });
    };

    const addDelegate = async () => {
        if (!selectedDelegate) return;
        await fetch(`/api/course-instances/${id}/book`, {
            method: 'POST',
            body: JSON.stringify({ delegateId: selectedDelegate })
        });
        window.location.reload();
    };

    const removeDelegate = async (bookingId: string) => {
        if (!confirm("Remove this delegate from the roster?")) return;
        await fetch(`/api/course-instances/${id}/bookings/${bookingId}`, { method: 'DELETE' });
        window.location.reload();
    };

    if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse">Syncing Pipeline Data...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-10 px-6">
            <header className="bg-slate-900 text-white rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
                <div className="relative z-10 space-y-8">
                    <Link href="/dashboard/instances" className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 hover:text-white transition-opacity">← Back to Schedule</Link>
                    <div className="space-y-1">
                        <h1 className="text-6xl font-black tracking-tighter leading-none">{instance.courseId?.title}</h1>
                        <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mt-2 opacity-60">Operations Briefing</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 border-t border-white/10 pt-8">
                        <div>
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Schedule</p>
                            <p className="text-sm font-bold truncate">{new Date(instance.startDate).toLocaleDateString()} — {new Date(instance.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Trainers</p>
                            <p className="text-sm font-bold">{instance.trainerIds?.map((t: any) => t.name).join(', ') || 'Unassigned'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Enrolled</p>
                            <p className="text-sm font-bold">{instance.bookings?.length || 0} / Unlimited</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">Location</p>
                            <p className="text-sm font-bold uppercase tracking-tighter">{instance.location}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 px-2">Active Roster</h2>
                    <div className="bg-white border-2 border-slate-50 rounded-[3rem] overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b">
                            <tr>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Delegate</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Attendance</th>
                                <th className="px-10 py-6"></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {instance.bookings.map((b: any) => (
                                <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-10 py-8">
                                        <p className="font-black text-slate-900 leading-none mb-1">{b.delegateId.firstName} {b.delegateId.lastName}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{b.delegateId.organisationId?.name || 'Private'}</p>
                                    </td>
                                    <td className="px-10 py-8 text-center">
                                        <button
                                            onClick={() => toggleAttendance(b.delegateId._id, b.attended)}
                                            className={cn(
                                                "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                b.attended ? "bg-green-100 text-green-700 border border-green-200" : "bg-slate-100 text-slate-400 border border-slate-200"
                                            )}
                                        >
                                            {b.attended ? 'Present' : 'Mark Present'}
                                        </button>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button onClick={() => removeDelegate(b._id)} className="text-slate-200 hover:text-red-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 px-2">Quick Enrolment</h2>
                    <div className="bg-white p-10 rounded-[3.5rem] border-2 border-slate-50 shadow-sm space-y-8 sticky top-10">
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black tracking-tighter text-slate-900">Directory Search</h3>
                            <div className="relative group">
                                <input
                                    value={directorySearch}
                                    onChange={(e) => setDirectorySearch(e.target.value)}
                                    placeholder="Find delegate or company..."
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                />
                                <div className="absolute right-4 top-3.5 text-slate-200 group-focus-within:text-indigo-400 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Search Results</p>
                            <select
                                size={5}
                                value={selectedDelegate}
                                onChange={(e) => setSelectedDelegate(e.target.value)}
                                className="w-full bg-white border-2 border-slate-50 rounded-[2rem] p-3 text-xs font-bold outline-none overflow-y-auto max-h-[220px]"
                            >
                                {filteredDirectory.map(d => (
                                    <option key={d._id} value={d._id} className="p-3 border-b border-slate-50 last:border-0 hover:bg-indigo-50 rounded-xl cursor-pointer">
                                        {d.firstName} {d.lastName} ({d.organisationId?.name || 'Private'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={addDelegate}
                            disabled={!selectedDelegate}
                            className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black disabled:opacity-20 disabled:grayscale transition-all"
                        >
                            Deploy to Course
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}