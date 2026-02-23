import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import Link from "next/link";
import { dbConnect } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Organisation from "@/models/Organisation";
import CourseInstance from "@/models/CourseInstance";

export default async function DashboardPage() {
    const session = await auth();
    const recentQuotes = await Quote.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('organisationId', 'name')
        .lean();
    if (!session) {
        redirect("/");
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                        Welcome back, {session.user?.name?.split(" ")[0]}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Manage your ITIL, AGILE, and PRINCE2 training schedules.
                    </p>
                </div>
            </header>

            {/* Quick Analytics using Magic UI NumberTicker */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Pending Quotes</p>
                    <div className="text-4xl font-black text-blue-600">
                        <NumberTicker value={12} />
                    </div>
                </div>
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Delegates Trained (YTD)</p>
                    <div className="text-4xl font-black text-green-600">
                        <NumberTicker value={845} />
                    </div>
                </div>
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Active Course Instances</p>
                    <div className="text-4xl font-black text-purple-600">
                        <NumberTicker value={24} />
                    </div>
                </div>
            </div>

            {/* Primary Actions with Magic Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/dashboard/quotes/new" className="block group">
                    <MagicCard
                        className="p-8 h-full transition-all cursor-pointer"
                        gradientColor="rgba(37,99,235,0.1)"
                    >
                        <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                            Create New Quote
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            Draft a new financial quotation for a client container. Automatically enforces mandatory exam logic and the minimum delegate requirements.
                        </p>
                    </MagicCard>
                </Link>

                <Link href="/dashboard/instances" className="block group">
                    <MagicCard
                        className="p-8 h-full transition-all cursor-pointer"
                        gradientColor="rgba(147,51,234,0.1)"
                    >
                        <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-purple-600 transition-colors">
                            Manage Scheduling
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            Assign trainers to specific virtual or in-person instances, attach course materials, and review current delegate booking capacities.
                        </p>
                    </MagicCard>
                </Link>

                <div className="mt-12 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Recent Quotations</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-white border-b border-gray-100 text-xs uppercase text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Client</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Delegates</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Date Created</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {recentQuotes.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No quotes generated yet.
                                    </td>
                                </tr>
                            ) : (
                                recentQuotes.map((quote: any) => (
                                    <tr key={quote._id.toString()} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {quote.organisationId?.name || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${quote.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                          quote.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' :
                              'bg-green-100 text-green-700'}`}
                      >
                        {quote.status.replace('_', ' ')}
                      </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {quote.delegateCount} {quote.delegateCount < 5 && '⚠️'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(quote.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}