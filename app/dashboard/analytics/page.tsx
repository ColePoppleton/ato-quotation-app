import { NumberTicker } from "@/components/ui/number-ticker";
import { dbConnect } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import Delegate from "@/models/Delegate";
import CourseInstance from "@/models/CourseInstance";

export default async function AnalyticsPage() {
    // Connect to the Atlas database directly on the server
    await dbConnect();

    // Run multiple database queries simultaneously for speed
    const [
        totalDelegates,
        activeInstances,
        financialStats
    ] = await Promise.all([
        Delegate.countDocuments({}),
        CourseInstance.countDocuments({ endDate: { $gte: new Date() } }),
        // Use MongoDB's powerful aggregation pipeline to sum up the financials
        Quote.aggregate([
            { $match: { status: { $in: ['approved', 'sent'] } } },
            { $group: {
                    _id: null,
                    totalValue: { $sum: "$financials.totalPrice" },
                    totalQuotes: { $sum: 1 }
                }
            }
        ])
    ]);

    const totalValue = financialStats[0]?.totalValue || 0;
    const approvedQuotesCount = financialStats[0]?.totalQuotes || 0;

    return (
        <div className="p-10 space-y-8 min-h-screen bg-gray-50">
            <h2 className="text-3xl font-bold">Quotation & Training Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <span className="text-sm text-gray-500 uppercase tracking-wider mb-2">
            Total Value of Approved Quotes
          </span>
                    <div className="text-5xl font-extrabold text-green-600 flex items-center">
                        $ <NumberTicker value={totalValue} />
                    </div>
                    <span className="text-xs text-gray-400 mt-4">Across {approvedQuotesCount} active quotes</span>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <span className="text-sm text-gray-500 uppercase tracking-wider mb-2">
            Total Logged Delegates
          </span>
                    <div className="text-5xl font-extrabold text-blue-600">
                        <NumberTicker value={totalDelegates} />
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 md:col-span-2">
          <span className="text-sm text-gray-500 uppercase tracking-wider mb-2">
            Upcoming Course Instances
          </span>
                    <div className="text-5xl font-extrabold text-purple-600">
                        <NumberTicker value={activeInstances} />
                    </div>
                </div>
            </div>
        </div>
    );
}