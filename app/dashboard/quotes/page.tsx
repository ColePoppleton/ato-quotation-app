import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import DownloadPdfButton from "@/components/DownloadPdfButton";

export default async function QuotesPage() {
    await auth();
    await dbConnect();

    const quotes = await Quote.find({})
        .sort({ createdAt: -1 })
        .populate('organisationId', 'name')
        .populate({ path: 'courseInstanceId', populate: { path: 'courseId', select: 'title' } })
        .lean();

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900">All Quotations</h1>
                <Link href="/dashboard/quotes/new" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">
                    + New Quote
                </Link>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                    <tr>
                        <th className="px-6 py-4">Client</th>
                        <th className="px-6 py-4">Course</th>
                        <th className="px-6 py-4">Total Value</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {quotes.map((rawQuote: any) => {
                        // Flatten the Mongoose object so Next.js can pass it safely to the Client Component
                        const quote = JSON.parse(JSON.stringify(rawQuote));

                        return (
                            <tr key={quote._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold text-gray-900">{quote.organisationId?.name}</td>
                                <td className="px-6 py-4">{quote.courseInstanceId?.courseId?.title}</td>
                                <td className="px-6 py-4 font-bold text-green-600">
                                    £{quote.financials?.totalPrice?.toLocaleString() || 0}
                                </td>
                                <td className="px-6 py-4 uppercase font-bold text-xs">{quote.status.replace('_', ' ')}</td>
                                <td className="px-6 py-4 flex gap-3">
                                    {/* Pass the flattened quote */}
                                    <DownloadPdfButton quote={quote} />
                                    <DeleteButton endpoint={`/api/quotes/${quote._id}`} />
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