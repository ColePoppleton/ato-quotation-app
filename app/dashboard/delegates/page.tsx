import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/mongodb";
import Delegate from "@/models/Delegate";
import Organisation from "@/models/Organisation";

export default async function DelegatesPage() {
    const session = await auth();
    if (!session) redirect("/");

    await dbConnect();
    const delegates = await Delegate.find({})
        .sort({ createdAt: -1 })
        .populate({ path: 'organisationId', model: Organisation, select: 'name' })
        .lean();

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Delegates</h1>
                    <p className="text-gray-500 mt-1">Log of all individual learners tied to corporate clients.</p>
                </div>
                <Link href="/dashboard/delegates/new" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    + Log Delegate
                </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
                    <tr>
                        <th className="px-6 py-4 font-semibold tracking-wider">Name</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Email</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Organisation</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {delegates.length === 0 ? (
                        <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No delegates registered.</td></tr>
                    ) : (
                        delegates.map((delegate: any) => (
                            <tr key={delegate._id.toString()} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {delegate.firstName} {delegate.lastName}
                                </td>
                                <td className="px-6 py-4">{delegate.email}</td>
                                <td className="px-6 py-4 text-blue-600 font-medium">
                                    {delegate.organisationId?.name || "Unknown"}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}