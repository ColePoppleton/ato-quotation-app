import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import CourseInstance from "@/models/CourseInstance";
import Course from "@/models/Course";
import Trainer from "@/models/Trainer";
import Link from "next/link";
import AutoQuoteButton from "@/components/AutoQuoteButton";
import { cn } from "@/lib/utils";
import DeleteButton from "@/components/DeleteButton";

export default async function InstancesPage() {
    await auth();
    await dbConnect();

    const instances = await CourseInstance.find({})
        .sort({ startDate: 1 })
        .populate({ path: 'courseId', model: Course, select: 'title' })
        .populate({ path: 'trainerIds', model: Trainer, select: 'name' })
        .lean();

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-10">
            <header className="flex justify-between items-end">
                <div className="space-y-2">
                    <h1 className="text-6xl font-black tracking-tighter text-slate-900">Schedule</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Training Operations Pipeline</p>
                </div>
                <Link href="/dashboard/instances/new" className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-indigo-700 transition-all">
                    + New Instance
                </Link>
            </header>

            <div className="grid gap-6">
                {instances.map((instance: any) => (
                    <div key={instance._id.toString()} className="group bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm flex flex-col md:flex-row items-center gap-10 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-50 transition-all">
                        {/* Date Circle */}
                        <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-[2rem] h-28 w-28 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <span className="text-xs font-black uppercase tracking-widest opacity-60">
                                {new Date(instance.startDate).toLocaleString('default', { month: 'short' })}
                            </span>
                            <span className="text-4xl font-black tracking-tighter">
                                {new Date(instance.startDate).getDate()}
                            </span>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full border",
                                    instance.deliveryType === 'virtual' ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-orange-50 border-orange-100 text-orange-600"
                                )}>
                                    {instance.deliveryType}
                                </span>
                                <p className="text-xs font-bold text-slate-400">
                                    {new Date(instance.startDate).toLocaleDateString()} — {new Date(instance.endDate).toLocaleDateString()}
                                </p>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                                {instance.courseId?.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {instance.trainerIds?.map((t: any) => (
                                    <span key={t._id} className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                                        {t.name}
                                    </span>
                                )) || <span className="text-xs font-bold text-red-400">⚠️ No Trainer Assigned</span>}
                            </div>
                        </div>

                        {/* Interaction Hub */}
                        <div className="flex flex-col gap-3 min-w-[160px]">
                            <Link href={`/dashboard/instances/${instance._id}/roster`} className="px-8 py-3 bg-slate-900 text-white text-xs font-black rounded-2xl text-center hover:bg-black transition-colors">
                                Manage Roster
                            </Link>
                            <AutoQuoteButton instanceId={instance._id.toString()} />
                            <DeleteButton endpoint={`/api/course-instances/${instance._id}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}