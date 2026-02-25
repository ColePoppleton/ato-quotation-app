import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { dbConnect } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Delegate from "@/models/Delegate";
import CourseInstance from "@/models/CourseInstance";
import Settings from "@/models/Settings";
import RevenueChart from "@/components/RevenueChart";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect("/");

    await dbConnect();

    // Parallel data fetching for high performance
    const [brandSettings, pendingCount, delegatesCount, activeCount, recentQuotes, chartQuotes] = await Promise.all([
        Settings.findOne({}).lean() || { primaryColor: '#2563EB' },
        Quote.countDocuments({ status: { $in: ['draft', 'pending_approval'] } }),
        Delegate.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) } }),
        CourseInstance.countDocuments({ endDate: { $gte: new Date() } }),
        Quote.find({}).sort({ createdAt: -1 }).limit(5).populate('organisationId', 'name').lean(),
        Quote.find({
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
            status: { $ne: 'draft' }
        }).lean()
    ]);

    const brandColor = (brandSettings as any).primaryColor || '#2563EB';

    // Aggregate monthly totals for the Revenue Chart
    const monthlyTotals = chartQuotes.reduce((acc: any, q: any) => {
        const month = new Date(q.createdAt).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + (q.financials?.totalPrice || 0);
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
        <div className="max-w-7xl mx-auto space-y-10 font-sans">
            <header className="space-y-1">
                <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Home</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Live Metrics</p>
            </header>

            {/* Top Level KPIs using MagicCard and Brand Colors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MagicStatsCard label="Pipeline Quotes" value={pendingCount} color={brandColor} />
                <MagicStatsCard label="Learners YTD" value={delegatesCount} color={brandColor} />
                <MagicStatsCard label="Active Schedules" value={activeCount} color={brandColor} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Momentum Chart */}
                <div className="lg:col-span-2 bg-white border-2 border-slate-50 rounded-[3rem] p-10 shadow-2xl shadow-slate-100/50 transition-all">
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Revenue Pipeline</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rolling 6-Month Performance</p>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <RevenueChart data={chartData} />
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white border-2 border-slate-50 rounded-[3rem] p-10 shadow-sm flex flex-col">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8">Recent Flow</h3>
                    <div className="space-y-6 flex-1">
                        {recentQuotes.map((quote: any) => (
                            <div key={quote._id.toString()} className="group flex flex-col border-b border-slate-50 pb-6 last:border-0 hover:bg-slate-50/50 transition-colors p-2 rounded-2xl">
                                <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {quote.organisationId?.name}
                                </span>
                                <div className="flex justify-between items-center mt-2">
                                    <span
                                        style={{ borderLeft: `3px solid ${brandColor}` }}
                                        className="text-[8px] font-black uppercase text-slate-400 tracking-widest pl-2"
                                    >
                                        {quote.status}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-300">
                                        {new Date(quote.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MagicStatsCard({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <MagicCard
            gradientColor={`${color}10`}
            className="p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col items-center text-center group hover:scale-[1.02] transition-transform"
        >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 group-hover:text-slate-600 transition-colors">
                {label}
            </p>
            <div className="text-6xl font-black tracking-tighter" style={{ color: color }}>
                <NumberTicker value={value} />
            </div>
        </MagicCard>
    );
}