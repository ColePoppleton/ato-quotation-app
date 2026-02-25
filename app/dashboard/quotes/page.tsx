import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import DownloadPdfButton from "@/components/DownloadPdfButton";
import StatusDropdown from "@/components/StatusDropdown";
import {cn} from "@/lib/utils";

export default async function QuotesPage() {
    await auth();
    await dbConnect();

    const quotes = await Quote.find({})
        .sort({ createdAt: -1 })
        .populate('organisationId', 'name')
        .populate({ path: 'courseInstanceId', populate: { path: 'courseId', select: 'title' } })
        .lean();

    return (
        <div className="max-w-6xl mx-auto space-y-10 py-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-gray-900">Quotations</h1>
                </div>
                <Link href="/dashboard/quotes/new" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-xl">
                    + New Quote
                </Link>
            </header>

            <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm mx-6">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50/50 border-b-2 border-gray-100 text-[10px] uppercase text-gray-400 font-black tracking-[0.2em]">
                    <tr>
                        <th className="px-10 py-6">Client & Status</th>
                        <th className="px-10 py-6">Value</th>
                        <th className="px-10 py-6">Workflow</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {quotes.map((rawQuote: any) => {
                        const quote = JSON.parse(JSON.stringify(rawQuote));
                        const isHistoric = new Date(quote.courseInstanceId?.endDate) < new Date();

                        return (
                            <tr key={quote._id} className={cn("transition-colors group", isHistoric ? "bg-slate-50/50 grayscale-[0.3]" : "hover:bg-gray-50/50")}>
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-gray-900 text-base">{quote.organisationId?.name}</p>
                                        {isHistoric && <span className="text-[8px] font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded-md uppercase">Historic</span>}
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">{quote.courseInstanceId?.courseId?.title}</p>
                                </td>
                                <td className="px-10 py-8">
                                        <span className={cn("font-black text-xl tracking-tighter", isHistoric ? "text-slate-400" : "text-green-600")}>
                                            £{quote.financials?.totalPrice?.toLocaleString() || 0}
                                        </span>
                                </td>
                                <td className="px-10 py-8">
                                    <StatusDropdown quoteId={quote._id} initialStatus={quote.status} disabled={isHistoric} />
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <div className="flex justify-end items-center gap-4">
                                        <Link href={`/dashboard/quotes/${quote._id}/edit`} className="p-2 text-slate-400 hover:text-blue-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </Link>
                                        <DownloadPdfButton quote={quote} />
                                        <DeleteButton endpoint={`/api/quotes/${quote._id}`} />
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