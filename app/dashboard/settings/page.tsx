"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/number-ticker";

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("branding");

    useEffect(() => {
        fetch('/api/settings').then(res => res.json()).then(data => {
            if (data.success) setSettings(data.data);
        });
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            // Optional: trigger a metadata revalidation if needed
        } finally {
            setIsSaving(false);
        }
    };

    if (!settings) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <p className="font-black text-slate-300 uppercase tracking-[0.4em] text-xs animate-pulse">Syncing Preferences...</p>
        </div>
    );

    const brandColor = settings.primaryColor || "#2563EB";

    return (
        <div className="max-w-7xl mx-auto space-y-12 py-6 font-sans">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <h1 className="text-7xl font-black tracking-tighter text-slate-900 leading-none uppercase">Config</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] ml-2 text-indigo-600">Global System Variables</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ backgroundColor: brandColor }}
                    className="px-12 py-5 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                    {isSaving ? "Synchronizing..." : "Commit Changes"}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Side: Navigation & Form */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Section: Brand Identity */}
                    <section className="bg-white p-12 border-2 border-slate-50 rounded-[3.5rem] shadow-2xl shadow-slate-100/50 space-y-10">
                        <div className="space-y-1 border-l-4 pl-6" style={{ borderColor: brandColor }}>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Identity & Aesthetics</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public-facing brand assets</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Company Name</label>
                                <input type="text" value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Primary Accent (Hex)</label>
                                <div className="flex gap-3">
                                    <div className="relative w-16 h-16 shrink-0">
                                        <input type="color" value={settings.primaryColor} onChange={e => setSettings({...settings, primaryColor: e.target.value})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <div className="w-full h-full rounded-2xl shadow-inner border-4 border-white" style={{ backgroundColor: brandColor }} />
                                    </div>
                                    <input type="text" value={settings.primaryColor} onChange={e => setSettings({...settings, primaryColor: e.target.value})} className="flex-1 bg-slate-50 border-none px-5 rounded-2xl font-mono font-bold text-slate-900 uppercase" />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Logo Asset Source (URL)</label>
                                <input type="url" value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-indigo-600 outline-none" placeholder="https://..." />
                            </div>
                        </div>
                    </section>

                    {/* Section: Operational Logic */}
                    <section className="bg-white p-12 border-2 border-slate-50 rounded-[3.5rem] shadow-sm space-y-10">
                        <div className="space-y-1 border-l-4 border-slate-900 pl-6">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial & Logistics</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global defaults for quoting and scheduling</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">VAT Rate (%)</label>
                                <input type="number" value={settings.vatRate || 20} onChange={e => setSettings({...settings, vatRate: Number(e.target.value)})} className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-900" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mileage (£/mi)</label>
                                <input type="number" step="0.01" value={settings.mileageRate} onChange={e => setSettings({...settings, mileageRate: Number(e.target.value)})} className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-900" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Roster Cap</label>
                                <input type="number" value={settings.defaultMaxEnrollments || 12} onChange={e => setSettings({...settings, defaultMaxEnrollments: Number(e.target.value)})} className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-900" />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Side: Live System Preview */}
                <div className="lg:col-span-4">
                    <div className="sticky top-12 space-y-8">
                        <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.47 4.09-3.13 7.75-7 8.99V11.99H5V6.3l7-3.11v8.8z"/></svg>
                            </div>

                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-8 relative z-10">Live Environment Preview</p>

                            <div className="space-y-8 relative z-10">
                                {/* Logo Preview */}
                                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 flex items-center justify-center border border-white/10 h-32">
                                    {settings.logoUrl ? (
                                        <img src={settings.logoUrl} alt="Logo" className="max-h-full object-contain" />
                                    ) : (
                                        <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Logo Placeholder</span>
                                    )}
                                </div>

                                {/* Sidebar Mockup */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: brandColor }} />
                                        <div className="h-2 w-24 bg-white/20 rounded-full" />
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 opacity-50">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 shrink-0" />
                                        <div className="h-2 w-32 bg-white/10 rounded-full" />
                                    </div>
                                </div>

                                {/* Component Accent Preview */}
                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Accent Propagation</span>
                                        <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: brandColor }} />
                                    </div>
                                    <div className="h-12 w-full rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest shadow-lg transition-colors" style={{ backgroundColor: brandColor }}>
                                        Sample CTA Button
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-[2.5rem]">
                            <h4 className="text-indigo-900 font-black text-sm uppercase tracking-tight mb-2">Metadata Sync</h4>
                            <p className="text-indigo-700/70 text-[11px] font-bold leading-relaxed">
                                Updating the **Logo Asset** will automatically refresh the Favicon, Login Screen, and Sidebar across all administrator sessions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}