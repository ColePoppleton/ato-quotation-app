"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function EditCoursePage() {
    const { id } = useParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: "",
        examBody: "PeopleCert",
        requiresExam: true,
        costPerEnrollment: 0,
        materialsCost: 0,
        take2Cost: 0,
        examCost: 0,
        maxEnrollments: 12
    });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetch(`/api/courses/${id}`);
                const data = await res.json();
                if (data.success) {
                    setFormData(data.data);
                }
            } catch (err) {
                console.error("Failed to load course:", err);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchCourse();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/courses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) router.push("/dashboard/courses");
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    if (isLoading) return <div className="p-20 text-center animate-pulse font-black text-slate-300">Syncing Catalog Data...</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 space-y-10">
            <header className="space-y-1">
                <h1 className="text-5xl font-black tracking-tighter text-slate-900">Update Configuration</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Editing Product: {formData.title}</p>
            </header>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-10 items-start">
                <div className="space-y-10">
                    <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-6">
                        <div className="space-y-1 border-l-4 border-indigo-600 pl-4">
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Basics</h3>
                        </div>
                        <input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="Title"
                            className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold outline-none"
                        />
                        <select
                            value={formData.examBody}
                            onChange={(e) => setFormData({...formData, examBody: e.target.value})}
                            className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold outline-none"
                        >
                            <option>PeopleCert</option>
                            <option>APMG</option>
                            <option>Exin</option>
                            <option>Internal</option>
                        </select>
                    </section>

                    <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-6">
                        <div className="space-y-1 border-l-4 border-orange-500 pl-4">
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Tuition & Resits (£)</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tuition Fee</label>
                                <input type="number" value={formData.costPerEnrollment} onChange={(e) => setFormData({...formData, costPerEnrollment: Number(e.target.value)})} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Materials Cost</label>
                                <input type="number" value={formData.materialsCost} onChange={(e) => setFormData({...formData, materialsCost: Number(e.target.value)})} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Take 2 Voucher</label>
                                <input type="number" value={formData.take2Cost} onChange={(e) => setFormData({...formData, take2Cost: Number(e.target.value)})} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-10 sticky top-10">
                    <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-6">
                        <div className="space-y-1 border-l-4 border-indigo-600 pl-4">
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Voucher Logic</h3>
                        </div>
                        <div className="flex bg-slate-50 p-1 rounded-2xl border">
                            <button type="button" onClick={() => setFormData({...formData, requiresExam: true})} className={cn("flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all", formData.requiresExam ? "bg-white shadow-md text-indigo-600" : "text-slate-400")}>Mandatory</button>
                            <button type="button" onClick={() => setFormData({...formData, requiresExam: false})} className={cn("flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all", !formData.requiresExam ? "bg-white shadow-md text-indigo-600" : "text-slate-400")}>Optional</button>
                        </div>
                        {formData.requiresExam && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Exam Cost (£)</label>
                                <input type="number" value={formData.examCost} onChange={(e) => setFormData({...formData, examCost: Number(e.target.value)})} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" />
                            </div>
                        )}
                    </section>

                    <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-4">
                        <div className="space-y-1 border-l-4 border-indigo-600 pl-4">
                            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Capacity Cap</h3>
                        </div>
                        <input type="number" value={formData.maxEnrollments} onChange={(e) => setFormData({...formData, maxEnrollments: Number(e.target.value)})} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" />
                        <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg shadow-2xl hover:bg-black transition-all">
                            Save Changes
                        </button>
                    </section>
                </div>
            </form>
        </div>
    );
}