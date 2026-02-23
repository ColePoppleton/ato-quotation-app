"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditQuotePage() {
    const { id } = useParams();
    const router = useRouter();
    const [quote, setQuote] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    // Logistics Inputs
    const [originPostcode, setOriginPostcode] = useState("");
    const [destPostcode, setDestPostcode] = useState("");

    useEffect(() => {
        fetch(`/api/quotes/${id}`).then(res => res.json()).then(data => {
            if (data.success) setQuote(data.data);
        });
    }, [id]);

    const calculateDistance = async () => {
        if (!originPostcode || !destPostcode) return alert("Enter both postcodes");
        setIsCalculating(true);
        try {
            const [oRes, dRes] = await Promise.all([
                fetch(`https://api.postcodes.io/postcodes/${originPostcode}`),
                fetch(`https://api.postcodes.io/postcodes/${destPostcode}`)
            ]);
            const oData = await oRes.json();
            const dData = await dRes.json();

            const osrm = await fetch(`https://router.project-osrm.org/route/v1/driving/${oData.result.longitude},${oData.result.latitude};${dData.result.longitude},${dData.result.latitude}?overview=false`);
            const route = await osrm.json();

            const miles = Math.ceil((route.routes[0].distance * 0.000621371) * 2); // Round trip
            const travelCost = miles * 0.45; // HMRC Rate

            setQuote({
                ...quote,
                financials: { ...quote.financials, travelCost }
            });
        } catch (err) { alert("Mapping error"); }
        finally { setIsCalculating(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Final total calculation before sync
        const f = quote.financials;
        const total = Number(f.basePrice) + Number(f.examFees) + Number(f.travelCost) + Number(f.accommodationCost);

        await fetch(`/api/quotes/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...quote, financials: { ...f, totalPrice: total } })
        });

        router.push('/dashboard/quotes');
    };

    if (!quote) return <div className="p-20 text-center font-medium text-slate-400">Loading Quote Data...</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-10">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-slate-900">Refine Quote</h1>
                    <p className="text-slate-500 font-medium">{quote.organisationId?.name} — {quote.courseInstanceId?.courseId?.title}</p>
                </div>
            </header>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Financial Adjustments */}
                <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm grid grid-cols-2 gap-8">
                    <div className="col-span-2"><h2 className="text-lg font-bold text-slate-900">Direct Financials</h2></div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Tuition (£)</label>
                        <input type="number" value={quote.financials.basePrice} onChange={e => setQuote({...quote, financials: {...quote.financials, basePrice: e.target.value}})} className="w-full bg-slate-50 border-none p-4 rounded-xl font-medium" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accommodation (£)</label>
                        <input type="number" value={quote.financials.accommodationCost} onChange={e => setQuote({...quote, financials: {...quote.financials, accommodationCost: e.target.value}})} className="w-full bg-slate-50 border-none p-4 rounded-xl font-medium" />
                    </div>
                </div>

                {/* Logistics & Mapping Hub */}
                <div className="bg-slate-900 p-10 rounded-3xl text-white space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold">Travel & Logistics (HMRC 0.45)</h2>
                        <span className="text-blue-400 font-mono text-xl">£{quote.financials.travelCost.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <input placeholder="Origin (Postcode)" value={originPostcode} onChange={e => setOriginPostcode(e.target.value)} className="bg-white/10 border-white/10 p-4 rounded-xl text-white outline-none focus:ring-1 ring-blue-500" />
                        <input placeholder="Dest (Postcode)" value={destPostcode} onChange={e => setDestPostcode(e.target.value)} className="bg-white/10 border-white/10 p-4 rounded-xl text-white outline-none focus:ring-1 ring-blue-500" />
                        <button type="button" onClick={calculateDistance} disabled={isCalculating} className="bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all">
                            {isCalculating ? "Mapping..." : "Calculate Route"}
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={isSaving} className="w-full py-6 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl">
                    {isSaving ? "Syncing Database..." : "Update Quotation"}
                </button>
            </form>
        </div>
    );
}