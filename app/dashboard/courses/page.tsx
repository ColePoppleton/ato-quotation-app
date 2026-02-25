import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/mongodb";
import Course from "@/models/Course";
import DeleteButton from "@/components/DeleteButton";
import { cn } from "@/lib/utils";

export default async function CoursesPage({
                                              searchParams
                                          }: {
    searchParams: Promise<{ q?: string, exam?: string }>
}) {
    const session = await auth();
    if (!session) redirect("/");

    await dbConnect();
    const params = await searchParams;
    const q = params.q || "";
    const examFilter = params.exam || "all";

    // Build Search/Filter Query
    let filter: any = {};
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (examFilter === 'mandatory') filter.requiresExam = true;
    if (examFilter === 'optional') filter.requiresExam = false;

    const courses = await Course.find(filter).sort({ title: 1 }).lean();

    return (
        <div className="max-w-7xl mx-auto space-y-12 py-10 px-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <h1 className="text-7xl font-black tracking-tighter text-slate-900 leading-none">Catalog</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Master Product Definitions</p>
                </div>
                <Link href="/dashboard/courses/new" className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                    + Define New Course
                </Link>
            </header>

            {/* Unified Search & Filter Control Bar */}
            <form className="bg-white p-4 rounded-[2.5rem] border-2 border-slate-100 shadow-2xl shadow-slate-100 flex flex-col lg:flex-row items-stretch gap-3">
                <div className="flex-1 group relative">
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Search product title..."
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <Link
                        href="?exam=all"
                        className={cn("px-6 py-4 text-[10px] font-black uppercase rounded-2xl transition-all flex items-center",
                            examFilter === 'all' ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400")}
                    >
                        All
                    </Link>
                    <Link
                        href="?exam=mandatory"
                        className={cn("px-6 py-4 text-[10px] font-black uppercase rounded-2xl transition-all flex items-center",
                            examFilter === 'mandatory' ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-400")}
                    >
                        Mandatory Exam
                    </Link>
                    <button type="submit" className="px-8 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200">
                        Apply Filter
                    </button>
                </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {courses.map((course: any) => (
                    <div key={course._id.toString()} className="bg-white border-2 border-slate-50 p-8 rounded-[3rem] shadow-sm hover:shadow-2xl hover:shadow-indigo-50/50 transition-all flex flex-col justify-between group">
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-slate-900 text-white px-4 py-1.5 rounded-full">
                                    {course.examBody || 'PeopleCert'}
                                </span>
                                {course.requiresExam && (
                                    <div className="flex items-center gap-1.5 text-indigo-600">
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Mandatory Exam</span>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-3xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                {course.title}
                            </h3>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Tuition Fee</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tighter">£{course.costPerEnrollment || 0}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Max Cap</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tighter">{course.maxEnrollments || 12} <span className="text-[10px] opacity-30">PA</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-50 flex justify-between items-center">
                            <Link href={`/dashboard/courses/${course._id}/edit`} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2">
                                Edit Configuration <span className="text-lg leading-none">→</span>
                            </Link>
                            <DeleteButton endpoint={`/api/courses/${course._id}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}