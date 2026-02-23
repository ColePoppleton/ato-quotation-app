import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/mongodb";
import Trainer from "@/models/Trainer";

export default async function TrainersPage() {
    const session = await auth();
    if (!session) redirect("/");

    await dbConnect();
    const trainers = await Trainer.find({}).sort({ name: 1 }).lean();

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Instructors</h1>
                    <p className="text-gray-500 mt-1">Manage training staff and their certifications.</p>
                </div>
                <Link href="/dashboard/trainers/new" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    + Register Trainer
                </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
                    <tr>
                        <th className="px-6 py-4 font-semibold tracking-wider">Name</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Email</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Certifications</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {trainers.length === 0 ? (
                        <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No trainers registered.</td></tr>
                    ) : (
                        trainers.map((trainer: any) => (
                            <tr key={trainer._id.toString()} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{trainer.name}</td>
                                <td className="px-6 py-4">{trainer.email}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        {trainer.certifications?.map((cert: string) => (
                                            <span key={cert} className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-semibold">
                          {cert}
                        </span>
                                        ))}
                                    </div>
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