"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditQuotePage() {
    const { id } = useParams();
    const router = useRouter();
    const [quote, setQuote] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/quotes/${id}`).then(res => res.json()).then(data => setQuote(data.data));
    }, [id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        // Recalculate total before saving
        const base = Number(quote.financials.basePrice);
        const exams = Number(quote.financials.examFees);
        const travel = Number(quote.financials.travelCost);
        const hotel = Number(quote.financials.accommodationCost);
        quote.financials.totalPrice = base + exams + travel + hotel;

        await fetch(`/api/quotes/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quote)
        });
        router.push('/dashboard/quotes');
    };

    if (!quote) return <div className="p-20 text-center font-medium text-slate-400">Loading Quote...</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-8">
            <h1 className="text-4xl font-light tracking-tight text-slate-900">Edit Quotation</h1>
            <form onSubmit={handleSave} className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm space-y-6">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base Tuition (£)</label>
                        <input type="number" value={quote.financials.basePrice} onChange={e => setQuote({...quote, financials: {...quote.financials, basePrice: e.target.value}})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-medium" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accommodation (£)</label>
                        <input type="number" value={quote.financials.accommodationCost} onChange={e => setQuote({...quote, financials: {...quote.financials, accommodationCost: e.target.value}})} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-medium" />
                    </div>
                </div>
                <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg">
                    Update & Save Financials
                </button>
            </form>
        </div>
    );
}