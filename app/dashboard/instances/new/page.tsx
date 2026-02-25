"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NewInstancePage() {
    const router = useRouter();
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedTrainerIds, setSelectedTrainerIds] = useState<string[]>([]); // Multi-select support
    const [deliveryType, setDeliveryType] = useState("virtual");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [location, setLocation] = useState("");
    const [courses, setCourses] = useState<any[]>([]);
    const [trainers, setTrainers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [cRes, tRes] = await Promise.all([fetch('/api/courses'), fetch('/api/trainers')]);
            const cData = await cRes.json();
            const tData = await tRes.json();
            if (cData.success) setCourses(cData.data);
            if (tRes.ok) setTrainers(tData.data);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const toggleTrainer = (id: string) => {
        setSelectedTrainerIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/course-instances', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseId: selectedCourseId,
                trainerIds: selectedTrainerIds,
                deliveryType, startDate, endDate, location
            }),
        });
        router.push("/dashboard/instances");
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 space-y-10">
            <header className="space-y-1">
                <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">New Schedule</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Deploy Training Resource</p>
            </header>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-10 items-start">
                <div className="space-y-10">
                    <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-6">
                        <div className="space-y-1 border-l-4 border-indigo-600 pl-4">
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Core Details</h3>
                            <p className="text-[10px] font-bold text-slate-400">Master Course & Delivery Method</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Master Course</label>
                                <select required value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold">
                                    <option value="" disabled>Select Master Course</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Delivery Pipeline</label>
                                <div className="flex bg-slate-50 p-1 rounded-2xl border">
                                    {['virtual', 'in-person'].map(t => (
                                        <button key={t} type="button" onClick={() => setDeliveryType(t)} className={cn("flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all", deliveryType === t ? "bg-white shadow-md text-indigo-600" : "text-slate-400")}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-6">
                        <div className="space-y-1 border-l-4 border-indigo-600 pl-4">
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Logistics</h3>
                            <p className="text-[10px] font-bold text-slate-400">Timeline & Physical/Virtual Location</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" />
                            <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" />
                        </div>
                        <input required type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Zoom Link or Address" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" />
                    </section>
                </div>

                <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-6 sticky top-10">
                    <div className="space-y-1 border-l-4 border-indigo-600 pl-4">
                        <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Personnel Assignment</h3>
                        <p className="text-[10px] font-bold text-slate-400">Select one or more Lead Trainers</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                        {trainers.map(t => (
                            <button key={t._id} type="button" onClick={() => toggleTrainer(t._id)} className={cn("flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left", selectedTrainerIds.includes(t._id) ? "border-indigo-600 bg-indigo-50" : "border-slate-50 bg-slate-50 hover:border-slate-200")}>
                                <span className="text-sm font-bold">{t.name}</span>
                                {selectedTrainerIds.includes(t._id) && <span className="text-indigo-600 font-black text-xs">✓</span>}
                            </button>
                        ))}
                    </div>

                    <div className="pt-6">
                        <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg shadow-2xl hover:bg-black transition-all">Deploy Instance</button>
                    </div>
                </section>
            </form>
        </div>
    );
}