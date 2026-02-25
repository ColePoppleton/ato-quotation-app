import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Settings from "@/models/Settings";
import Organisation from "@/models/Organisation";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import DownloadPdfButton from "@/components/DownloadPdfButton";
import StatusDropdown from "@/components/StatusDropdown";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function QuotesPage({
                                             searchParams
                                         }: {
    searchParams: Promise<{ q?: string, status?: string }>
}) {
    await auth();
    await dbConnect();
    const params = await searchParams;
    const q = params.q || "";
    const statusFilter = params.status || "all";

    const brandSettings = await Settings.findOne().lean() || { primaryColor: '#2563EB' };

    // Advanced search logic for Quotes
    let query: any = {};
    if (q) {
        const matchingOrgs = await Organisation.find({ name: { $regex: q, $options: 'i' } }).select('_id');
        query.$or = [
            { organisationId: { $in: matchingOrgs.map(o => o._id) } },
            // Add other search criteria here if needed
        ];
    }
    if (statusFilter !== 'all') query.status = statusFilter;

    const rawQuotes = await Quote.find(query)
        .sort({ createdAt: -1 })
        .populate('organisationId', 'name')
        .populate({ path: 'courseInstanceId', populate: { path: 'courseId', select: 'title' } })
        .lean();

    const quotes = JSON.parse(JSON.stringify(rawQuotes));

    return (
        <div className="max-w-7xl mx-auto space-y-12 py-10 px-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-7xl font-black tracking-tighter text-slate-900 leading-none">Quotations</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Commercial Workflow</p>
                </div>
                <Link
                    href="/dashboard/quotes/new"
                    style={{ backgroundColor: brandSettings.primaryColor }}
                    className="px-10 py-4 text-white rounded-[1.5rem] font-black shadow-xl hover:opacity-90 transition-all"
                >
                    + New Quote
                </Link>
            </header>

            <form className="bg-white p-4 rounded-[2.5rem] border-2 border-slate-100 shadow-2xl flex flex-col lg:flex-row items-stretch gap-3">
                <input name="q" defaultValue={q} placeholder="Search client name..." className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none" />
                <div className="flex gap-3">
                    <select name="status" defaultValue={statusFilter} className="bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-black uppercase text-slate-600 outline-none">
                        <option value="all">Workflow Status</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="approved">Approved</option>
                    </select>
                    <button type="submit" style={{ backgroundColor: brandSettings.primaryColor }} className="px-8 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90">Search</button>
                </div>
            </form>

            <div className="bg-white border-2 border-slate-50 rounded-[3rem] shadow-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-slate-50/50 border-b text-[10px] uppercase text-gray-400 font-black tracking-[0.2em]">
                    <tr>
                        <th className="px-10 py-6">Client & Project</th>
                        <th className="px-10 py-6">Value</th>
                        <th className="px-10 py-6 text-right">Workflow & Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {quotes.map((quote: any) => {
                        const isHistoric = new Date(quote.courseInstanceId?.endDate) < new Date();
                        return (
                            <tr key={quote._id} className={cn("transition-colors group", isHistoric ? "bg-slate-50/50 grayscale-[0.3]" : "hover:bg-gray-50/50")}>
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-gray-900 text-lg leading-tight">{quote.organisationId?.name}</p>
                                        {isHistoric && <span className="text-[8px] font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded-md uppercase">Historic</span>}
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest leading-none">{quote.courseInstanceId?.courseId?.title}</p>
                                </td>
                                <td className="px-10 py-8">
                                        <span className={cn("font-black text-2xl tracking-tighter", isHistoric ? "text-slate-400" : "text-green-600")}>
                                            £{quote.financials?.totalPrice?.toLocaleString() || 0}
                                        </span>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <div className="flex justify-end items-center gap-6">
                                        <StatusDropdown quoteId={quote._id} initialStatus={quote.status} disabled={isHistoric} />
                                        <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
                                            <Link href={`/dashboard/quotes/${quote._id}/edit`} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </Link>
                                            <DownloadPdfButton quote={quote} />
                                            <DeleteButton endpoint={`/api/quotes/${quote._id}`} />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}