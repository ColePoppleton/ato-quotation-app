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
        <div className="max-w-6xl mx-auto space-y-10">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Instructors</h1>
                <Link href="/dashboard/trainers/new" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl text-sm">
                    Register Trainer
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trainers.map((trainer: any) => (
                    <div key={trainer._id.toString()} className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm flex items-start gap-6 hover:shadow-lg transition-all">
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xl font-bold shrink-0">
                            {trainer.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-slate-900 truncate">{trainer.name}</h3>
                            <a href={`mailto:${trainer.email}`} className="text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors">{trainer.email}</a>

                            <div className="flex flex-wrap gap-1.5 mt-4">
                                {trainer.certifications?.map((cert: string) => (
                                    <span key={cert} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md text-[10px] font-bold uppercase tracking-tighter">
                                        {cert}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}