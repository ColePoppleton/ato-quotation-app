"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NewCoursePage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [examBody, setExamBody] = useState("PeopleCert");
    const [requiresExam, setRequiresExam] = useState(true);
    const [costPerEnrollment, setCostPerEnrollment] = useState(450);
    const [materialsCost, setMaterialsCost] = useState(25);
    const [take2Cost, setTake2Cost] = useState(55);
    const [examCost, setExamCost] = useState(120);
    const [maxEnrollments, setMaxEnrollments] = useState(12);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title, examBody, requiresExam,
                    costPerEnrollment: Number(costPerEnrollment),
                    materialsCost: Number(materialsCost),
                    take2Cost: Number(take2Cost),
                    examCost: Number(examCost),
                    maxEnrollments: Number(maxEnrollments)
                }),
            });
            router.push("/dashboard/courses");
        } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 space-y-10">
            <header className="space-y-1">
                <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Define Course</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Financial & Logistics Blueprint</p>
            </header>

            <form onSubmit={handleCreateCourse} className="grid md:grid-cols-2 gap-10 items-start">
                <div className="space-y-10">
                    <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-6">
                        <div className="space-y-1 border-l-4 border-indigo-600 pl-4">
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Product Basics</h3>
                            <p className="text-[10px] font-bold text-slate-400">Title and Exam Authority</p>
                        </div>
                        <div className="space-y-4">
                            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course Title (e.g. ITIL 4 Foundation)" className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" />
                            <select value={examBody} onChange={(e) => setExamBody(e.target.value)} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold">
                                <option>PeopleCert</option>
                                <option>APMG</option>
                                <option>Exin</option>
                                <option>Internal</option>
                            </select>
                        </div>
                    </section>

                    <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-6">
                        <div className="space-y-1 border-l-4 border-orange-500 pl-4">
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Tuition & Resits</h3>
                            <p className="text-[10px] font-bold text-slate-400">Base Unit Costs (£)</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tuition Price</label>
                                <input type="number" value={costPerEnrollment} onChange={(e) => setCostPerEnrollment(Number(e.target.value))} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Take 2 Voucher</label>
                                <input type="number" value={take2Cost} onChange={(e) => setTake2Cost(Number(e.target.value))} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Book/Materials Cost</label>
                            <input type="number" value={materialsCost} onChange={(e) => setMaterialsCost(Number(e.target.value))} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" />
                        </div>
                    </section>
                </div>

                <div className="space-y-10 sticky top-10">
                    <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-6">
                        <div className="space-y-1 border-l-4 border-indigo-600 pl-4">
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Exam Voucher Logic</h3>
                            <p className="text-[10px] font-bold text-slate-400">Mandatory Requirements</p>
                        </div>
                        <div className="flex bg-slate-50 p-1 rounded-2xl border">
                            <button type="button" onClick={() => setRequiresExam(true)} className={cn("flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all", requiresExam ? "bg-white shadow-md text-indigo-600" : "text-slate-400")}>Mandatory</button>
                            <button type="button" onClick={() => setRequiresExam(false)} className={cn("flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all", !requiresExam ? "bg-white shadow-md text-indigo-600" : "text-slate-400")}>Optional</button>
                        </div>
                        {requiresExam && (
                            <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mandatory Voucher Price (£)</label>
                                <input type="number" value={examCost} onChange={(e) => setExamCost(Number(e.target.value))} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" />
                            </div>
                        )}
                    </section>

                    <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-6">
                        <div className="space-y-1 border-l-4 border-indigo-600 pl-4">
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Capacity</h3>
                            <input type="number" value={maxEnrollments} onChange={(e) => setMaxEnrollments(Number(e.target.value))} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold mt-2" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg shadow-2xl hover:bg-black transition-all">
                            {isSubmitting ? "Syncing..." : "Publish to Catalog"}
                        </button>
                    </section>
                </div>
            </form>
        </div>
    );
}