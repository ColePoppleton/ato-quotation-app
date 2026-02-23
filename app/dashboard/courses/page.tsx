import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/mongodb";
import Course from "@/models/Course";
import DeleteButton from "@/components/DeleteButton";

export default async function CoursesPage() {
    const session = await auth();
    if (!session) redirect("/");

    await dbConnect();
    const courses = await Course.find({}).sort({ title: 1 }).lean();

    return (
        <div className="max-w-6xl mx-auto space-y-10 py-6">
            <header className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-4xl font-light tracking-tight text-slate-900">Course Catalog</h1>
                    <p className="text-slate-500 font-medium">Standardized training definitions and exam logic.</p>
                </div>
                <Link href="/dashboard/courses/new" className="px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-black transition-all shadow-sm">
                    + Create Course
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                    <div key={course._id.toString()} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between group">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                    {course.examBody}
                                </span>
                                {course.requiresExam && (
                                    <span className="text-[10px] font-bold text-emerald-600 border border-emerald-100 bg-emerald-50 px-2 py-1 rounded uppercase">
                                        Exam Mandatory
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                                {course.title}
                            </h3>
                        </div>
                        <div className="mt-8 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-xs text-slate-400">ID: {course._id.toString().slice(-6)}</span>
                            <button className="text-xs font-bold text-slate-900 hover:underline">Edit Catalog →</button>
                            <DeleteButton endpoint={`/api/courses/${course._id}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}