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

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
    const session = await auth();
    if (!session) redirect("/");

    await dbConnect();

    // Fetch Brand Context and Aggregate Data in Parallel
    const [
        brandSettings,
        totalDelegates,
        activeInstances,
        revenueByStatus,
        popularCourses,
        monthlyTrend
    ] = await Promise.all([
        Settings.findOne({}).lean() || { primaryColor: '#2563EB' },
        Delegate.countDocuments({}),
        CourseInstance.countDocuments({ endDate: { $gte: new Date() } }),
        Quote.aggregate([
            { $group: { _id: "$status", total: { $sum: "$financials.totalPrice" } } }
        ]),
        CourseInstance.aggregate([
            { $unwind: "$bookings" },
            { $group: { _id: "$courseId", students: { $sum: 1 } } },
            { $sort: { students: -1 } },
            { $limit: 5 },
            { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
            { $unwind: "$course" }
        ]),
        Quote.aggregate([
            { $match: { status: { $in: ['approved', 'sent', 'paid'] } } },
            { $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    value: { $sum: "$financials.totalPrice" }
                } },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 12 }
        ])
    ]);

    const brandColor = (brandSettings as any).primaryColor || '#2563EB';
    const chartData = monthlyTrend.map(t => ({
        month: new Date(t._id.year, t._id.month - 1).toLocaleString('default', { month: 'short' }),
        value: t.value
    }));

    const approvedRev = revenueByStatus.find(r => r._id === 'approved')?.total || 0;
    const paidRev = revenueByStatus.find(r => r._id === 'paid')?.total || 0;

    return (
        <div className="max-w-7xl mx-auto space-y-12 font-sans">
            <header className="space-y-1">
                <h1 className="text-7xl font-black tracking-tighter text-slate-900 leading-none uppercase">Analytics</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] ml-2">Live Analytical Dashboard</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard label="Settled Revenue" value={paidRev} prefix="£" color="#10B981" />
                <KpiCard label="Approved WIP" value={approvedRev} prefix="£" color={brandColor} />
                <KpiCard label="Learner Base" value={totalDelegates} color="#6366F1" />
                <KpiCard label="Active Schedules" value={activeInstances} color="#F59E0B" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white border-2 border-slate-50 rounded-[3.5rem] p-10 shadow-2xl shadow-slate-100/50">
                    <div className="space-y-1 mb-10">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Financial Momentum</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rolling 12-Month Performance</p>
                    </div>
                    <div className="h-[350px]">
                        <RevenueChart data={chartData} />
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-50 rounded-[3.5rem] p-10 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8">Best Sellers</h3>
                    <div className="space-y-6">
                        {popularCourses.map((c: any) => (
                            <div key={c._id.toString()} className="flex items-center justify-between group">
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-900 truncate tracking-tight">{c.course.title}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.course.examBody}</p>
                                </div>
                                <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                    <span className="text-xs font-black text-slate-900">{c.students}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ label, value, prefix = "", color }: { label: string, value: number, prefix?: string, color: string }) {
    return (
        <MagicCard gradientColor={`${color}15`} className="p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex flex-col items-center text-center group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{label}</p>
            <div className="text-5xl font-black tracking-tighter" style={{ color }}>
                {prefix}<NumberTicker value={value} />
            </div>
        </MagicCard>
    );
}