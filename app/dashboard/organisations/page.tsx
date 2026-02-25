import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Organisation from "@/models/Organisation";
import Settings from "@/models/Settings";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function OrganisationsPage({
                                                    searchParams
                                                }: {
    searchParams: Promise<{ q?: string, city?: string }>
}) {
    await auth();
    await dbConnect();
    const params = await searchParams;
    const q = params.q || "";
    const cityFilter = params.city || "all";

    const brandSettings = await Settings.findOne().lean() || { primaryColor: '#2563EB' };

    let query: any = {};
    if (q) {
        query.$or = [
            { name: { $regex: q, $options: 'i' } },
            { contactEmail: { $regex: q, $options: 'i' } }
        ];
    }
    if (cityFilter !== 'all') {
        query["billingAddress.city"] = cityFilter;
    }

    const organisations = await Organisation.find(query).sort({ createdAt: -1 }).lean();
    const cities = await Organisation.distinct("billingAddress.city");

    return (
        <div className="max-w-7xl mx-auto space-y-12 py-10 px-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <h1 className="text-7xl font-black tracking-tighter text-slate-900 leading-none">Clients</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">CLient Lists</p>
                </div>
                <Link
                    href="/dashboard/organisations/new"
                    style={{ backgroundColor: brandSettings.primaryColor }}
                    className="px-10 py-4 text-white rounded-[1.5rem] font-black shadow-xl hover:opacity-90 transition-all text-center"
                >
                    + Add Client
                </Link>
            </header>

            <form className="bg-white p-4 rounded-[2.5rem] border-2 border-slate-100 shadow-2xl flex flex-col lg:flex-row items-stretch gap-3">
                <div className="relative flex-1">
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Search company name or contact..."
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select name="city" defaultValue={cityFilter} className="bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-black uppercase text-slate-600 outline-none">
                        <option value="all">Global Locations</option>
                        {cities.map((c: string) => c && <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                        type="submit"
                        style={{ backgroundColor: brandSettings.primaryColor }}
                        className="px-8 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
                    >
                        Sync Results
                    </button>
                </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {organisations.map((org: any) => (
                    <div key={org._id.toString()} className="group bg-white border-2 border-slate-50 p-8 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all">
                        <div className="flex flex-col h-full space-y-6">
                            <div className="flex-1">
                                <h3 className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight tracking-tight">{org.name}</h3>
                                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{org.contactEmail}</p>
                                <div className="mt-6 flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
                                        📍 {org.billingAddress?.city || "Remote"}
                                    </span>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">UID: {org._id.toString().slice(-6)}</span>
                                <Link href={`/dashboard/organisations/${org._id}`} className="text-[10px] font-black uppercase text-slate-900 tracking-widest hover:underline decoration-2 underline-offset-4">
                                    Edit Details →
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}