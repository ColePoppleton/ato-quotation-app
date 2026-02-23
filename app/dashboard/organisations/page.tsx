import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Organisation from "@/models/Organisation";
import Link from "next/link";

export default async function OrganisationsPage() {
    await auth();
    await dbConnect();
    const organisations = await Organisation.find({}).sort({ createdAt: -1 }).lean();

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Corporate Clients</h1>
                <Link href="/dashboard/organisations/new" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all text-sm">
                    Add Client
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organisations.map((org: any) => (
                    <div key={org._id.toString()} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
                        <div className="flex flex-col h-full">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{org.name}</h3>
                                <p className="text-sm text-slate-500 mt-1">{org.contactEmail}</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                                        {org.billingAddress?.city || "Remote"}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">ID: {org._id.toString().slice(-6)}</span>
                                <Link href={`/dashboard/organisations/${org._id}`} className="text-xs font-bold text-slate-900">Edit Details →</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}