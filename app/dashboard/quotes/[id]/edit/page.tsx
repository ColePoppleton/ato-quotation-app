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
    const [mileageRate, setMileageRate] = useState(0.45);

    useEffect(() => {
        fetch(`/api/quotes/${id}`).then(res => res.json()).then(data => {
            if (data.success) {
                const fetchedQuote = data.data;

                // ✅ IMPROVED LOGIC:
                // Only generate placeholders if the delegates array is truly null or undefined.
                // If the array exists (even if partially empty), keep it.
                if (!fetchedQuote.delegates) {
                    fetchedQuote.delegates = Array.from({ length: fetchedQuote.delegateCount || 1 }, () => ({
                        firstName: "", lastName: "", wantsMaterials: false, wantsTake2: false
                    }));
                }

                setQuote(fetchedQuote);
                if (fetchedQuote.financials?.mileageRate) setMileageRate(fetchedQuote.financials.mileageRate);
            }
        });
    }, [id]);

    const bookPrice = quote?.courseInstanceId?.courseId?.materialsCost || 25;
    const take2Price = quote?.courseInstanceId?.courseId?.take2Cost || 50;

    const toggleDelegateOption = (index: number, field: "wantsMaterials" | "wantsTake2") => {
        const updatedDelegates = [...(quote.delegates || [])];
        if (updatedDelegates[index]) {
            updatedDelegates[index][field] = !updatedDelegates[index][field];
            setQuote({ ...quote, delegates: updatedDelegates });
        }
    };

    // --- RE-ADDED: Mapping Calculation Function ---
    const calculateDistance = async () => {
        if (!originPostcode || !destPostcode) return alert("Enter both postcodes");
        setIsCalculating(true);
        try {
            const [oRes, dRes] = await Promise.all([
                fetch(`https://api.postcodes.io/postcodes/${originPostcode.trim()}`),
                fetch(`https://api.postcodes.io/postcodes/${destPostcode.trim()}`)
            ]);
            const oData = await oRes.json();
            const dData = await dRes.json();

            if (oData.status !== 200 || dData.status !== 200) throw new Error("Invalid Postcode");

            const osrm = await fetch(`https://router.project-osrm.org/route/v1/driving/${oData.result.longitude},${oData.result.latitude};${dData.result.longitude},${dData.result.latitude}?overview=false`);
            const route = await osrm.json();

            const miles = Math.ceil((route.routes[0].distance * 0.000621371) * 2);
            const travelCost = miles * mileageRate;

            setQuote({
                ...quote,
                financials: { ...quote.financials, travelCost, totalMiles: miles }
            });
        } catch (err) {
            alert("Mapping error: Ensure postcodes are valid UK formats.");
        } finally {
            setIsCalculating(false);
        }
    };

    const calculateLiveTotal = () => {
        if (!quote) return 0;
        const f = quote.financials || {};
        const delegates = quote.delegates || [];

        const materialsTotal = delegates.filter((d: any) => d?.wantsMaterials).length * bookPrice;
        const take2Total = delegates.filter((d: any) => d?.wantsTake2).length * take2Price;

        return (
            Number(f.basePrice || 0) +
            Number(f.examFees || 0) +
            Number(f.travelCost || 0) +
            Number(f.accommodationCost || 0) +
            materialsTotal +
            take2Total
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const currentDelegates = quote.delegates || [];
        const materialsTotal = currentDelegates.filter((d: any) => d.wantsMaterials).length * bookPrice;
        const take2Total = currentDelegates.filter((d: any) => d.wantsTake2).length * take2Price;

        await fetch(`/api/quotes/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...quote,
                financials: {
                    ...quote.financials,
                    mileageRate,
                    trainingMaterialsCost: materialsTotal,
                    take2Cost: take2Total,
                    totalPrice: calculateLiveTotal()
                }
            })
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
                <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">£{calculateLiveTotal().toFixed(2)}</p>
                </div>
            </header>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Delegate List Section */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-lg font-bold text-slate-900">Delegate Requirements</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {(quote.delegates || []).map((delegate: any, index: number) => {
                            const fullName = (delegate.firstName || delegate.lastName)
                                ? `${delegate.firstName} ${delegate.lastName}`.trim()
                                : null;

                            return (
                                <div key={index} className="px-8 py-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">
                            {fullName || `Delegate ${index + 1} (Name TBD)`}
                        </span>
                                        {delegate.email && <span className="text-xs text-slate-400">{delegate.email}</span>}
                                    </div>
                                    <div className="flex gap-6">
                                        <label className="flex items-center space-x-2 cursor-pointer bg-slate-100 px-3 py-2 rounded-lg">
                                            <input type="checkbox" checked={!!delegate.wantsMaterials} onChange={() => toggleDelegateOption(index, 'wantsMaterials')} className="w-4 h-4 text-blue-600" />
                                            <span className="text-[10px] font-bold uppercase">Book (£{bookPrice})</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer bg-slate-100 px-3 py-2 rounded-lg">
                                            <input type="checkbox" checked={!!delegate.wantsTake2} onChange={() => toggleDelegateOption(index, 'wantsTake2')} className="w-4 h-4 text-blue-600" />
                                            <span className="text-[10px] font-bold uppercase">Take 2 (£{take2Price})</span>
                                        </label>
                                    </div>
                                </div>
                            ); // Added closing semicolon and parenthesis here
                        })}
                    </div>
                </div>

                {/* Direct Financials */}
                <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm grid grid-cols-2 gap-8">
                    <div className="col-span-2"><h2 className="text-lg font-bold text-slate-900">Direct Financials</h2></div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Tuition (£)</label>
                        <input type="number" value={quote.financials.basePrice} onChange={e => setQuote({...quote, financials: {...quote.financials, basePrice: e.target.value}})} className="w-full bg-slate-50 border-none p-4 rounded-xl font-medium outline-none focus:ring-2 ring-blue-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accommodation (£)</label>
                        <input type="number" value={quote.financials.accommodationCost} onChange={e => setQuote({...quote, financials: {...quote.financials, accommodationCost: e.target.value}})} className="w-full bg-slate-50 border-none p-4 rounded-xl font-medium outline-none focus:ring-2 ring-blue-500" />
                    </div>
                </div>

                {/* Logistics & Mapping Hub */}
                <div className="bg-slate-900 p-10 rounded-3xl text-white space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-lg font-bold">Travel & Logistics</h2>
                            <div className="flex items-center bg-white/10 rounded-lg px-3 py-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase mr-2">Rate:</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={mileageRate}
                                    onChange={(e) => setMileageRate(parseFloat(e.target.value))}
                                    className="bg-transparent border-none p-0 w-12 text-blue-400 font-bold focus:ring-0"
                                />
                            </div>
                        </div>
                        <span className="text-blue-400 font-mono text-xl">£{Number(quote.financials.travelCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <input placeholder="Origin (Postcode)" value={originPostcode} onChange={e => setOriginPostcode(e.target.value)} className="bg-white/10 border-white/10 p-4 rounded-xl text-white outline-none focus:ring-1 ring-blue-500 placeholder:text-slate-500" />
                        <input placeholder="Dest (Postcode)" value={destPostcode} onChange={e => setDestPostcode(e.target.value)} className="bg-white/10 border-white/10 p-4 rounded-xl text-white outline-none focus:ring-1 ring-blue-500 placeholder:text-slate-500" />
                        <button type="button" onClick={calculateDistance} disabled={isCalculating} className="bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all text-sm">
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