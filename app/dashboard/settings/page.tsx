"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
    // 1. Branding State
    const [settings, setSettings] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    // 2. Financial Rates State
    const [trainers, setTrainers] = useState<any[]>([]);
    const [instances, setInstances] = useState<any[]>([]);

    // Fetch all data when the page loads
    useEffect(() => {
        Promise.all([
            fetch('/api/settings'),
            fetch('/api/trainers'),
            fetch('/api/course-instances')
        ]).then(async ([settingsRes, trainersRes, instancesRes]) => {
            const sData = await settingsRes.json();
            const tData = await trainersRes.json();
            const iData = await instancesRes.json();

            if (sData.success) setSettings(sData.data);
            if (tData.success) setTrainers(tData.data);
            if (iData.success) setInstances(iData.data);
        });
    }, []);

    // --- ACTIONS ---

    const handleSaveBranding = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await fetch('/api/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                companyName: settings.companyName,
                companyAddress: settings.companyAddress,
                primaryColor: settings.primaryColor,
                logoUrl: settings.logoUrl,
                mileageRate: settings.mileageRate // Added so you can update HMRC rates!
            })
        });
        setIsSaving(false);
        alert("Platform settings saved successfully!");
    };

    const updateRate = async (endpoint: string, id: string, payload: object) => {
        await fetch(`${endpoint}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        // No alert needed here to keep the UI smooth, it silently updates the DB when the user clicks away
    };

    if (!settings) return <div className="p-10 font-medium text-gray-500 flex items-center gap-3">Loading settings...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <h1 className="text-3xl font-extrabold text-gray-900">Platform Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT COLUMN: BRANDING FORM */}
                <form onSubmit={handleSaveBranding} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-5 h-fit">
                    <h2 className="text-xl font-bold mb-2">Company Branding & Defaults</h2>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Company Name</label>
                        <input type="text" value={settings.companyName || ''} onChange={e => setSettings({...settings, companyName: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Company Address</label>
                        <textarea value={settings.companyAddress || ''} onChange={e => setSettings({...settings, companyAddress: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Primary Color (Hex)</label>
                            <div className="flex gap-2">
                                <input type="color" value={settings.primaryColor || '#2563EB'} onChange={e => setSettings({...settings, primaryColor: e.target.value})} className="h-12 w-12 border rounded cursor-pointer" />
                                <input type="text" value={settings.primaryColor || '#2563EB'} onChange={e => setSettings({...settings, primaryColor: e.target.value})} className="flex-1 border border-gray-300 p-3 rounded-lg uppercase outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Travel Rate (£/mile)</label>
                            <input type="number" step="0.01" value={settings.mileageRate || 0.45} onChange={e => setSettings({...settings, mileageRate: Number(e.target.value)})} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Logo Image URL</label>
                        <input type="url" placeholder="https://..." value={settings.logoUrl || ''} onChange={e => setSettings({...settings, logoUrl: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        <p className="text-xs text-gray-500 mt-1">Provide a direct link to your company logo (PNG/JPG).</p>
                    </div>

                    <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-4 hover:bg-blue-700 transition-colors">
                        {isSaving ? "Saving..." : "Save Settings"}
                    </button>
                </form>

                {/* RIGHT COLUMN: FINANCIAL RATES */}
                <div className="space-y-8">

                    {/* Trainer Rates */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-bold mb-6">Trainer Daily Rates</h2>
                        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                            {trainers.map(t => (
                                <div key={t._id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                                    <span className="font-medium text-gray-700">{t.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 font-bold">£</span>
                                        <input
                                            type="number"
                                            defaultValue={t.dailyRate || 500}
                                            onBlur={(e) => updateRate('/api/trainers', t._id, { dailyRate: Number(e.target.value) })}
                                            className="w-24 border border-gray-300 p-2 rounded-lg text-right focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-bold"
                                        />
                                    </div>
                                </div>
                            ))}
                            {trainers.length === 0 && <p className="text-sm text-gray-500">No trainers registered yet.</p>}
                        </div>
                    </div>

                    {/* Course Instance Rates */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-bold mb-6">Charge Per Delegate</h2>
                        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                            {instances.map(i => (
                                <div key={i._id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                                    <span className="font-medium text-gray-700">{i.courseId?.title} ({i.deliveryType})</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500 font-bold">£</span>
                                        <input
                                            type="number"
                                            defaultValue={i.pricePerDelegate || 1000}
                                            onBlur={(e) => updateRate('/api/course-instances', i._id, { pricePerDelegate: Number(e.target.value) })}
                                            className="w-24 border border-gray-300 p-2 rounded-lg text-right focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-bold"
                                        />
                                    </div>
                                </div>
                            ))}
                            {instances.length === 0 && <p className="text-sm text-gray-500">No instances scheduled yet.</p>}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}