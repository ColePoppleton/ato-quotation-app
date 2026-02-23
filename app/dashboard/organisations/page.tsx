import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/mongodb";
import Organisation from "@/models/Organisation";

export default async function OrganisationsPage() {
    const session = await auth();
    if (!session) redirect("/");

    await dbConnect();
    const organisations = await Organisation.find({}).sort({ createdAt: -1 }).lean();

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Corporate Clients</h1>
                    <p className="text-gray-500 mt-1">Manage client organisations and billing details.</p>
                </div>
                <Link href="/dashboard/organisations/new" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    + Add Client
                </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
                    <tr>
                        <th className="px-6 py-4 font-semibold tracking-wider">Company Name</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Contact Email</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">City</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Date Added</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {organisations.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No clients registered.</td></tr>
                    ) : (
                        organisations.map((org: any) => (
                            <tr key={org._id.toString()} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{org.name}</td>
                                <td className="px-6 py-4">{org.contactEmail}</td>
                                <td className="px-6 py-4">{org.billingAddress?.city || "N/A"}</td>
                                <td className="px-6 py-4">{new Date(org.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}