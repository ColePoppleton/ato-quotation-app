import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/mongodb";
import Delegate from "@/models/Delegate";
import Organisation from "@/models/Organisation";
import Settings from "@/models/Settings";

export const dynamic = 'force-dynamic';

export default async function DelegatesPage({
                                                searchParams
                                            }: {
    searchParams: Promise<{ q?: string, orgId?: string }>
}) {
    const session = await auth();
    if (!session) redirect("/");

    await dbConnect();
    const params = await searchParams;
    const q = params.q || "";
    const orgId = params.orgId || "all";

    const brandSettings = await Settings.findOne().lean() || { primaryColor: '#2563EB' };

    let query: any = {};
    if (q) {
        query.$or = [
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
        ];
    }
    if (orgId !== 'all') {
        query.organisationId = orgId;
    }

    const delegates = await Delegate.find(query)
        .sort({ createdAt: -1 })
        .populate({ path: 'organisationId', model: Organisation, select: 'name' })
        .lean();

    const allOrganisations = await Organisation.find({}).select('name').sort({ name: 1 }).lean();

    return (
        <div className="max-w-7xl mx-auto space-y-12 py-10 px-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <h1 className="text-7xl font-black tracking-tighter text-slate-900 leading-none">Delegates</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Learning Community</p>
                </div>
                <Link
                    href="/dashboard/delegates/new"
                    style={{ backgroundColor: brandSettings.primaryColor }}
                    className="px-10 py-4 text-white rounded-[1.5rem] font-black shadow-xl hover:opacity-90 transition-all text-center"
                >
                    + Log Delegate
                </Link>
            </header>

            <form className="bg-white p-4 rounded-[2.5rem] border-2 border-slate-100 shadow-2xl flex flex-col lg:flex-row items-stretch gap-3">
                <div className="relative flex-1 group">
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Search learner name or email..."
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select name="orgId" defaultValue={orgId} className="bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-black uppercase text-slate-600 outline-none">
                        <option value="all">All Organisations</option>
                        {allOrganisations.map((o: any) => <option key={o._id} value={o._id.toString()}>{o.name}</option>)}
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

            <div className="bg-white border-2 border-slate-50 rounded-[3rem] shadow-2xl shadow-slate-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Learner Details</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Identity (Email)</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Affiliation</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {delegates.map((delegate: any) => (
                        <tr key={delegate._id.toString()} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-10 py-8 font-black text-slate-900 text-lg tracking-tight">
                                {delegate.firstName} {delegate.lastName}
                            </td>
                            <td className="px-10 py-8 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                {delegate.email}
                            </td>
                            <td className="px-10 py-8 text-right">
                                    <span
                                        style={{ borderLeft: `4px solid ${brandSettings.primaryColor}` }}
                                        className="text-[10px] font-black text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border-y border-r border-slate-100 uppercase"
                                    >
                                        {delegate.organisationId?.name || 'Private'}
                                    </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}