import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import Link from "next/link";
import { dbConnect } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Delegate from "@/models/Delegate";
import CourseInstance from "@/models/CourseInstance";
import RevenueChart from "@/components/RevenueChart";
import {cn} from "@/lib/utils";

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect("/");

    await dbConnect();

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
        pendingQuotesCount,
        delegatesYTDCount,
        activeInstancesCount,
        recentQuotes,
        chartQuotes
    ] = await Promise.all([
        Quote.countDocuments({ status: { $in: ['draft', 'pending_approval'] } }),
        Delegate.countDocuments({ createdAt: { $gte: startOfYear } }),
        CourseInstance.countDocuments({ endDate: { $gte: new Date() } }),
        Quote.find({}).sort({ createdAt: -1 }).limit(5).populate('organisationId', 'name').lean(),
        Quote.find({ createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'draft' } }).lean()
    ]);

    // Data Aggregation for Recharts
    const monthlyTotals = chartQuotes.reduce((acc: any, quote: any) => {
        const month = new Date(quote.createdAt).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + (quote.financials?.totalPrice || 0);
        return acc;
    }, {});

    const chartData = Object.keys(monthlyTotals).map(month => ({
        month,
        value: monthlyTotals[month]
    })).sort((a, b) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.indexOf(a.month) - months.indexOf(b.month);
    });

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
                    <p className="text-slate-500 font-medium">Here is what's happening with your courses today.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard label="Pending Quotes" value={pendingQuotesCount} color="text-blue-600" />
                <StatsCard label="Delegates YTD" value={delegatesYTDCount} color="text-emerald-600" />
                <StatsCard label="Active Instances" value={activeInstancesCount} color="text-violet-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-slate-900">Revenue Pipeline</h3>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last 6 Months</span>
                    </div>
                    <RevenueChart data={chartData} />
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Quotes</h3>
                    <div className="space-y-5">
                        {recentQuotes.map((quote: any) => (
                            <div key={quote._id} className="flex flex-col border-b border-slate-50 pb-4 last:border-0">
                                <span className="text-sm font-bold text-slate-900">{quote.organisationId?.name}</span>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{quote.status}</span>
                                    <span className="text-xs font-medium text-slate-500">{new Date(quote.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
            <div className={cn("text-4xl font-bold tracking-tight", color)}>
                <NumberTicker value={value} />
            </div>
        </div>
    );
}