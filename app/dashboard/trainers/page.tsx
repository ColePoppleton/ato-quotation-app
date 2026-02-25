import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/mongodb";
import Trainer from "@/models/Trainer";
import Settings from "@/models/Settings";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function TrainersPage({
                                               searchParams
                                           }: {
    searchParams: Promise<{ q?: string, cert?: string }>
}) {
    const session = await auth();
    if (!session) redirect("/");

    await dbConnect();
    const params = await searchParams;
    const q = params.q || "";
    const certFilter = params.cert || "all";

    // Fetch Brand Settings
    const brandSettings = await Settings.findOne().lean() || { primaryColor: '#2563EB' };

    // Build Search Query
    let query: any = {};
    if (q) {
        query.$or = [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
        ];
    }
    if (certFilter !== 'all') {
        query.certifications = certFilter;
    }

    const trainers = await Trainer.find(query).sort({ name: 1 }).lean();

    // Get unique certifications for filter dropdown
    const allCerts = await Trainer.distinct("certifications");

    return (
        <div className="max-w-7xl mx-auto space-y-12 py-10 px-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <h1 className="text-7xl font-black tracking-tighter text-slate-900 leading-none">Instructors</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Personnel Directory</p>
                </div>
                <Link
                    href="/dashboard/trainers/new"
                    style={{ backgroundColor: brandSettings.primaryColor }}
                    className="px-10 py-4 text-white rounded-[1.5rem] font-black shadow-xl hover:opacity-90 transition-all text-center"
                >
                    + Register Trainer
                </Link>
            </header>

            {/* Control Bar */}
            <form className="bg-white p-4 rounded-[2.5rem] border-2 border-slate-100 shadow-2xl flex flex-col lg:flex-row items-stretch gap-3">
                <div className="relative flex-1 group">
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Search instructor name or email..."
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select name="cert" defaultValue={certFilter} className="bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-black uppercase text-slate-600 outline-none">
                        <option value="all">All Certifications</option>
                        {allCerts.map((c: string) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                        type="submit"
                        style={{ backgroundColor: brandSettings.primaryColor }}
                        className="px-8 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
                    >
                        Apply Filters
                    </button>
                </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {trainers.map((trainer: any) => (
                    <div key={trainer._id.toString()} className="group bg-white border-2 border-slate-50 p-8 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all flex flex-col gap-6">
                        <div className="flex items-start gap-6">
                            <div
                                style={{ backgroundColor: brandSettings.primaryColor }}
                                className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-lg"
                            >
                                {trainer.name.split(" ").map((n: string) => n[0]).join("")}
                            </div>
                            <div className="min-w-0 space-y-1 pt-2">
                                <h3 className="text-2xl font-black text-slate-900 truncate tracking-tight">{trainer.name}</h3>
                                <p className="text-xs font-bold text-slate-400">{trainer.email}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                            {trainer.certifications?.map((cert: string) => (
                                <span key={cert} className="px-3 py-1.5 bg-slate-50 text-slate-500 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-wider">
                                    {cert}
                                </span>
                            ))}
                        </div>

                        <div className="mt-auto flex justify-between items-center pt-4">
                            <Link href={`/dashboard/trainers/${trainer._id}/edit`} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                                Edit Personnel →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}