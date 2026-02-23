import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/mongodb";
import CourseInstance from "@/models/CourseInstance";
import Course from "@/models/Course";
import Trainer from "@/models/Trainer";

export default async function InstancesPage() {
    const session = await auth();
    if (!session) {
        redirect("/");
    }

    // Force the database connection open
    await dbConnect();

    // Fetch all instances and populate the actual course titles and trainer names
    const instances = await CourseInstance.find({})
        .sort({ startDate: 1 }) // Sort chronologically so upcoming courses are first
        .populate({ path: 'courseId', model: Course, select: 'title' })
        .populate({ path: 'trainerIds', model: Trainer, select: 'name' })
        .lean();

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header and Action Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Scheduled Course Instances</h1>
                    <p className="text-gray-500 mt-1">Review all upcoming virtual and in-person training events.</p>
                </div>
                <Link
                    href="/dashboard/instances/new"
                    className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
                >
                    + Schedule New Instance
                </Link>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">Course</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Delivery</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Start Date</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">End Date</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Trainer(s)</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {instances.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No course instances scheduled yet.
                                </td>
                            </tr>
                        ) : (
                            instances.map((instance: any) => (
                                <tr key={instance._id.toString()} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {instance.courseId?.title || "Unknown Course"}
                                    </td>
                                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${instance.deliveryType === 'virtual' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}
                      >
                        {instance.deliveryType}
                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(instance.startDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(instance.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {instance.trainerIds?.length > 0
                                            ? instance.trainerIds.map((t: any) => t.name).join(', ')
                                            : <span className="text-red-500 font-medium">Unassigned</span>}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}