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
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Delegates</h1>
                <Link href="/dashboard/delegates/new" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl text-sm">
                    Log Delegate
                </Link>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Learner</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Email Address</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-right">Organisation</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {delegates.map((delegate: any) => (
                        <tr key={delegate._id.toString()} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5 font-bold text-slate-900">{delegate.firstName} {delegate.lastName}</td>
                            <td className="px-8 py-5 text-slate-500 font-medium">{delegate.email}</td>
                            <td className="px-8 py-5 text-right">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                                        {delegate.organisationId?.name}
                                    </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}