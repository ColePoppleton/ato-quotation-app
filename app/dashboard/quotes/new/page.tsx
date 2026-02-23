"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewQuotePage() {
    const router = useRouter();

    // Core Data
    const [organisations, setOrganisations] = useState<any[]>([]);
    const [instances, setInstances] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [selectedOrgId, setSelectedOrgId] = useState("");
    const [selectedInstanceId, setSelectedInstanceId] = useState("");
    const [delegateCount, setDelegateCount] = useState(1);
    const [includesExam, setIncludesExam] = useState(true);

    // Logistics & Mapping State
    const [originPostcode, setOriginPostcode] = useState("");
    const [destPostcode, setDestPostcode] = useState("");
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
    const [roundTripMileage, setRoundTripMileage] = useState(0);
    const [mileageRate, setMileageRate] = useState(0.45); // HMRC Base Rate
    const [accommodationCost, setAccommodationCost] = useState(0);

    useEffect(() => {
        Promise.all([fetch('/api/organisations'), fetch('/api/course-instances')])
            .then(async ([orgRes, instRes]) => {
                const orgData = await orgRes.json();
                const instData = await instRes.json();
                if (orgData.success) setOrganisations(orgData.data);
                if (instData.success) setInstances(instData.data);
                setIsLoading(false);
            });
    }, []);

    // --- MAP API CALCULATION FUNCTION ---
    const handleCalculateRoute = async () => {
        if (!originPostcode || !destPostcode) return alert("Please enter both postcodes.");
        setIsCalculatingRoute(true);

        try {
            // 1. Convert Postcodes to Coordinates (postcodes.io)
            const [originRes, destRes] = await Promise.all([
                fetch(`https://api.postcodes.io/postcodes/${originPostcode.trim()}`),
                fetch(`https://api.postcodes.io/postcodes/${destPostcode.trim()}`)
            ]);

            const originData = await originRes.json();
            const destData = await destRes.json();

            if (originData.status !== 200 || destData.status !== 200) {
                throw new Error("Invalid postcode entered.");
            }

            const { longitude: lon1, latitude: lat1 } = originData.result;
            const { longitude: lon2, latitude: lat2 } = destData.result;

            // 2. Query Open Source Routing Machine for driving distance
            const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
            const osrmData = await osrmRes.json();

            if (osrmData.code === "Ok") {
                const meters = osrmData.routes[0].distance;
                const miles = meters * 0.000621371;
                // Multiply by 2 for a round trip and round up
                setRoundTripMileage(Math.ceil(miles * 2));
            } else {
                throw new Error("Could not map a driving route.");
            }
        } catch (err: any) {
            alert(err.message || "Failed to calculate route.");
        } finally {
            setIsCalculatingRoute(false);
        }
    };

    // --- LIVE FINANCIAL CALCULATIONS ---
    const selectedInstance = instances.find(i => i._id === selectedInstanceId);
    const pricePerDelegate = selectedInstance?.pricePerDelegate || 1000;

    const basePrice = delegateCount * pricePerDelegate;
    const examFees = includesExam ? (delegateCount * 250) : 0;
    const travelCost = roundTripMileage * mileageRate;
    const totalPrice = basePrice + examFees + travelCost + accommodationCost;

    const handleCreateQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        await fetch('/api/quotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                organisationId: selectedOrgId,
                courseInstanceId: selectedInstanceId,
                delegateCount,
                includesExam,
                financials: { basePrice, examFees, travelCost, accommodationCost, totalPrice }
            }),
        });

        router.push("/dashboard/quotes");
    };

    return (
        <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-3xl p-10 shadow-sm flex flex-col md:flex-row gap-10">

            <form onSubmit={handleCreateQuote} className="flex-1 space-y-6">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Generate Quote</h2>

                {/* Selection Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Corporate Client</label>
                        <select required value={selectedOrgId} onChange={(e) => setSelectedOrgId(e.target.value)} disabled={isLoading} className="w-full border p-3 rounded-lg bg-gray-50">
                            <option value="" disabled>Select Client</option>
                            {organisations.map(org => <option key={org._id} value={org._id}>{org.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Course Instance</label>
                        <select required value={selectedInstanceId} onChange={(e) => setSelectedInstanceId(e.target.value)} disabled={isLoading} className="w-full border p-3 rounded-lg bg-gray-50">
                            <option value="" disabled>Select Course</option>
                            {instances.map(inst => <option key={inst._id} value={inst._id}>{inst.courseId?.title} - £{inst.pricePerDelegate || 1000}/head</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Delegates</label>
                        <input type="number" min="1" value={delegateCount} onChange={(e) => setDelegateCount(Number(e.target.value))} className="w-full border p-3 rounded-lg" />
                    </div>
                    <div className="flex items-center mt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={includesExam} onChange={(e) => setIncludesExam(e.target.checked)} className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-sm">Include Exams (£250/ea)</span>
                        </label>
                    </div>
                </div>

                {/* Smart Travel Calculations Section */}
                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-blue-900">Trainer Route Mapping</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500">Rate/Mile: £</span>
                            <input type="number" step="0.01" value={mileageRate} onChange={(e) => setMileageRate(Number(e.target.value))} className="w-16 p-1 border rounded text-sm text-center" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Origin Postcode</label>
                            <input type="text" value={originPostcode} onChange={(e) => setOriginPostcode(e.target.value.toUpperCase())} className="w-full border p-2 rounded-lg" placeholder="Trainer Home" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Dest. Postcode</label>
                            <input type="text" value={destPostcode} onChange={(e) => setDestPostcode(e.target.value.toUpperCase())} className="w-full border p-2 rounded-lg" placeholder="Client Site" />
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={handleCalculateRoute} disabled={isCalculatingRoute} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg transition-colors text-sm h-[38px]">
                                {isCalculatingRoute ? "Mapping..." : "Map Route"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-100">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Total Round-Trip Mileage</label>
                            <input type="number" min="0" value={roundTripMileage} onChange={(e) => setRoundTripMileage(Number(e.target.value))} className="w-full border p-2 rounded-lg font-bold text-blue-700" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Accommodation Cost (£)</label>
                            <input type="number" min="0" value={accommodationCost} onChange={(e) => setAccommodationCost(Number(e.target.value))} className="w-full border p-2 rounded-lg" placeholder="e.g. 120" />
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={isSubmitting || !selectedInstanceId} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-all text-lg shadow-sm mt-8">
                    {isSubmitting ? "Generating Document..." : "Save Official Quote"}
                </button>
            </form>

            {/* Live Financial Summary Sidebar */}
            <div className="w-full md:w-80 bg-gray-900 text-white p-8 rounded-3xl h-fit sticky top-10 flex flex-col justify-between shadow-lg">
                <div>
                    <h3 className="text-xl font-bold mb-6 text-gray-300">Quote Summary</h3>
                    <div className="space-y-4 text-sm font-medium">
                        <div className="flex justify-between"><span>Base Tuition:</span> <span>£{basePrice.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Exam Fees:</span> <span>£{examFees.toLocaleString()}</span></div>
                        <div className="flex justify-between text-blue-300">
                            <span>Travel ({roundTripMileage} mi):</span>
                            <span>£{travelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-blue-300"><span>Accommodation:</span> <span>£{accommodationCost.toLocaleString()}</span></div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-700">
                    <div className="flex justify-between items-end text-3xl font-black text-green-400 tracking-tight">
                        <span className="text-base font-bold text-gray-400 mb-1">Total:</span>
                        <span>£{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}