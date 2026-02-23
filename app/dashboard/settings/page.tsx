"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetch('/api/settings').then(res => res.json()).then(data => {
            if (data.success) setSettings(data.data);
        });
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        await fetch('/api/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        setIsSaving(false);
        alert("Configuration Synchronized.");
    };

    if (!settings) return <div className="p-20 text-center font-medium text-slate-400">Loading Preferences...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-8">
            <header className="flex justify-between items-end border-b border-slate-100 pb-8">
                <div className="space-y-1">
                    <h1 className="text-4xl font-light tracking-tight text-slate-900">Platform Configuration</h1>
                    <p className="text-slate-500 font-medium">Global branding, financial logic, and system appearance.</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50">
                    {isSaving ? "Syncing..." : "Save Changes"}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Side: Form */}
                <div className="lg:col-span-7 space-y-8">
                    <section className="space-y-6 bg-white p-8 border border-slate-200 rounded-3xl shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900">Brand Identity</h2>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                                <input type="text" value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brand Accent</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={settings.primaryColor}
                                            onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                                            className="h-10 w-10 rounded-lg cursor-pointer border-none"
                                        />
                                        <input
                                            type="text"
                                            value={settings.primaryColor}
                                            onChange={e => setSettings({...settings, primaryColor: e.target.value})} // ADDED THIS LINE
                                            className="flex-1 bg-slate-50 border border-slate-100 px-3 rounded-lg font-mono text-sm uppercase"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Travel Rate (£/mi)</label>
                                    <input type="number" step="0.01" value={settings.mileageRate} onChange={e => setSettings({...settings, mileageRate: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-medium" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logo Asset Link</label>
                                <input type="url" value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-medium text-blue-600" />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Side: High Fidelity Preview */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sticky top-8">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">System Preview</p>

                        {/* Mockup of Sidebar/Header */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-6">
                            <div className="h-20 w-full bg-slate-50 rounded-xl flex items-center justify-center p-4">
                                {settings.logoUrl ? (
                                    <img src={settings.logoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                                ) : (
                                    <span className="text-[10px] font-bold text-slate-300 uppercase">Logo Preview</span>
                                )}
                            </div>
                            <div className="w-full space-y-3">
                                <div className="h-2 w-full bg-slate-100 rounded-full" />
                                <div className="h-2 w-2/3 bg-slate-100 rounded-full" />
                                <div className="pt-4 flex justify-between items-center">
                                    <div className="h-8 w-24 rounded-lg" style={{ backgroundColor: settings.primaryColor }} />
                                    <span className="text-xs font-bold text-slate-900">{settings.companyName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-[10px] leading-relaxed">
                            <strong>NOTE:</strong> Colors and fonts updated here will propagate instantly across the Dashboard, Quotation PDFs, and Client Portals.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}