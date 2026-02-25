import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import CourseInstance from "@/models/CourseInstance";
import Course from "@/models/Course";
import Trainer from "@/models/Trainer";
import Settings from "@/models/Settings"; // Import Settings model
import Link from "next/link";
import AutoQuoteButton from "@/components/AutoQuoteButton";
import { cn } from "@/lib/utils";
import DeleteButton from "@/components/DeleteButton";

export default async function InstancesPage({
                                                searchParams
                                            }: {
    searchParams: Promise<{
        view?: string, month?: string, year?: string,
        q?: string, status?: string, courseId?: string, trainerId?: string
    }>
}) {
    await auth();
    await dbConnect();

    const params = await searchParams;
    const view = params.view || 'schedule';
    const q = params.q || '';
    const status = params.status || 'all';
    const courseId = params.courseId || 'all';
    const trainerId = params.trainerId || 'all';

    const now = new Date();
    const currentMonth = params.month ? parseInt(params.month) : now.getMonth();
    const currentYear = params.year ? parseInt(params.year) : now.getFullYear();

    // Fetch Brand Settings
    const brandSettings = await Settings.findOne().lean() || { primaryColor: '#2563EB' };

    const [rawCourses, rawTrainers] = await Promise.all([
        Course.find({}).select('title').lean(),
        Trainer.find({}).select('name').lean()
    ]);

    const allCourses = rawCourses.map((c: any) => ({ ...c, _id: c._id.toString() }));
    const allTrainers = rawTrainers.map((t: any) => ({ ...t, _id: t._id.toString() }));

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let mongoFilter: any = {};
    if (q) {
        const matches = await Promise.all([
            Course.find({ title: { $regex: q, $options: 'i' } }).select('_id'),
            Trainer.find({ name: { $regex: q, $options: 'i' } }).select('_id')
        ]);
        mongoFilter.$or = [
            { courseId: { $in: matches[0].map(c => c._id) } },
            { trainerIds: { $in: matches[1].map(t => t._id) } },
            { location: { $regex: q, $options: 'i' } }
        ];
    }
    if (status !== 'all') mongoFilter.deliveryType = status;
    if (courseId !== 'all') mongoFilter.courseId = courseId;
    if (trainerId !== 'all') mongoFilter.trainerIds = trainerId;

    const rawInstances = await CourseInstance.find(mongoFilter)
        .sort({ startDate: 1 })
        .populate({ path: 'courseId', model: Course, select: 'title' })
        .populate({ path: 'trainerIds', model: Trainer, select: 'name' })
        .lean();

    const instances = JSON.parse(JSON.stringify(rawInstances));

    const isHistoric = (date: Date) => new Date(date) < now;
    const upcoming = instances.filter((ins: any) => !isHistoric(new Date(ins.endDate)));
    const historic = instances
        .filter((ins: any) => isHistoric(new Date(ins.endDate)))
        .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return (
        <div className="max-w-7xl mx-auto space-y-12 py-10 px-6">
            <header className="space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-1">
                        <h1 className="text-7xl font-black tracking-tighter text-slate-900 leading-none">Schedule</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] ml-1">Upcoming Events</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] border border-slate-200 shadow-inner flex-1 md:flex-none">
                            <Link href={`?view=schedule&q=${q}&status=${status}&courseId=${courseId}&trainerId=${trainerId}`} className={cn("flex-1 md:flex-none px-8 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all", view === 'schedule' ? "bg-white shadow-lg text-indigo-600" : "text-slate-400 hover:text-slate-900")}>Schedule</Link>
                            <Link href={`?view=calendar&month=${currentMonth}&year=${currentYear}&q=${q}&status=${status}&courseId=${courseId}&trainerId=${trainerId}`} className={cn("flex-1 md:flex-none px-8 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all", view === 'calendar' ? "bg-white shadow-lg text-indigo-600" : "text-slate-400 hover:text-slate-900")}>Calendar</Link>
                        </div>
                        {/* RESTORED BUTTON: Using Brand Primary Color */}
                        <Link
                            href="/dashboard/instances/new"
                            style={{ backgroundColor: brandSettings.primaryColor }}
                            className="px-10 py-4 text-white rounded-[1.5rem] font-black shadow-xl hover:opacity-90 transition-all text-center whitespace-nowrap"
                        >
                            + New Instance
                        </Link>
                    </div>
                </div>

                <form className="bg-white p-4 rounded-[2.5rem] border-2 border-slate-100 shadow-2xl flex flex-col lg:flex-row items-stretch gap-3">
                    <input type="hidden" name="view" value={view} />
                    <div className="relative flex-1 group">
                        <input name="q" defaultValue={q} placeholder="Search anything..." className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <select name="courseId" defaultValue={courseId} className="bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-black uppercase text-slate-600 outline-none">
                            <option value="all">All Courses</option>
                            {allCourses.map((c: any) => <option key={c._id} value={c._id}>{c.title}</option>)}
                        </select>
                        <select name="trainerId" defaultValue={trainerId} className="bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-black uppercase text-slate-600 outline-none">
                            <option value="all">All Trainers</option>
                            {allTrainers.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        <button
                            type="submit"
                            style={{ backgroundColor: brandSettings.primaryColor }}
                            className="px-8 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all"
                        >
                            Apply
                        </button>
                    </div>
                </form>
            </header>

            {view === 'schedule' ? (
                <div className="space-y-12 pb-20">
                    <div className="grid gap-6">
                        {upcoming.map((ins: any) => <InstanceCard key={ins._id} instance={ins} historic={false} brandColor={brandSettings.primaryColor} />)}
                    </div>
                    {historic.length > 0 && (
                        <details className="opacity-50 group">
                            <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 outline-none">
                                Historical Archive ({historic.length})
                                <span className="h-px flex-1 bg-slate-100"></span>
                            </summary>
                            <div className="grid gap-6 pt-4">{historic.map((ins: any) => <InstanceCard key={ins._id} instance={ins} historic={true} brandColor={brandSettings.primaryColor} />)}</div>
                        </details>
                    )}
                </div>
            ) : (
                <div className="space-y-8 pb-20">
                    <div className="flex items-center justify-between bg-white px-8 py-6 rounded-[2.5rem] border shadow-sm">
                        <h2 className="text-3xl font-black tracking-tighter text-slate-900">
                            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex gap-3">
                            <Link href={`?view=calendar&month=${prevMonth}&year=${prevYear}&q=${q}&status=${status}&courseId=${courseId}&trainerId=${trainerId}`} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 border transition-colors shadow-sm">←</Link>
                            <Link href={`?view=calendar&month=${nextMonth}&year=${nextYear}&q=${q}&status=${status}&courseId=${courseId}&trainerId=${trainerId}`} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 border transition-colors shadow-sm">→</Link>
                        </div>
                    </div>
                    <div className="bg-white border-2 border-slate-50 rounded-[3.5rem] p-10 shadow-2xl shadow-slate-100 grid grid-cols-7 gap-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 pb-6">{day}</div>
                        ))}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayInstances = instances.filter((ins: any) => {
                                const d = new Date(ins.startDate);
                                return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                            });
                            return (
                                <div key={day} className="min-h-[140px] border border-slate-50 rounded-[2rem] p-3 space-y-2 bg-slate-50/30 hover:bg-white transition-all">
                                    <span className="text-xs font-black text-slate-200">{day}</span>
                                    <div className="space-y-1.5">
                                        {dayInstances.map((ins: any) => (
                                            <Link key={ins._id} href={`/dashboard/instances/${ins._id}/roster`} className={cn(
                                                "group relative block p-2 rounded-xl text-[9px] font-black truncate shadow-sm border transition-transform hover:-translate-y-0.5",
                                                isHistoric(new Date(ins.endDate)) ? "bg-white text-slate-300 border-slate-100 opacity-60" :
                                                    ins.deliveryType === 'virtual' ? "bg-indigo-600 text-white border-indigo-700" : "bg-orange-500 text-white border-orange-600"
                                            )}>
                                                {ins.courseId?.title}
                                                <div className="absolute hidden group-hover:block z-[100] bg-slate-900 text-white p-4 rounded-2xl w-48 -left-2 top-full mt-2 shadow-2xl border border-slate-800 pointer-events-none">
                                                    <p className="text-[10px] text-indigo-400 uppercase tracking-widest mb-1 font-black">Details</p>
                                                    <p className="text-xs font-black leading-tight mb-2">{ins.courseId?.title}</p>
                                                    <p className="text-[9px] opacity-70 mb-1">📍 {ins.location}</p>
                                                    <p className="text-[9px] opacity-70">👤 {ins.trainerIds?.[0]?.name || 'Unassigned'}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function InstanceCard({ instance, historic, brandColor }: { instance: any, historic: boolean, brandColor: string }) {
    return (
        <div className={cn("group bg-white border p-8 rounded-[3rem] shadow-sm flex flex-col md:flex-row items-center gap-10 transition-all", historic ? "grayscale py-6" : "hover:shadow-2xl hover:shadow-indigo-50")}>
            <div className={cn(
                "flex flex-col items-center justify-center border-2 rounded-[2.5rem] h-28 w-28 shrink-0 transition-all",
                historic ? "bg-slate-50 border-slate-100 text-slate-300" : "bg-slate-50 border-slate-100 group-hover:text-white group-hover:scale-105 shadow-sm"
            )}
                 style={!historic ? { backgroundColor: 'white', borderColor: '#f1f5f9' } : {}}
            >
                <div className="group-hover:hidden flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{new Date(instance.startDate).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-4xl font-black tracking-tighter">{new Date(instance.startDate).getDate()}</span>
                </div>
                <div
                    className="hidden group-hover:flex h-full w-full items-center justify-center rounded-[2.3rem]"
                    style={{ backgroundColor: brandColor }}
                >
                    <span className="text-white font-black text-xl">VIEW</span>
                </div>
            </div>
            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border",
                        instance.deliveryType === 'virtual' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-orange-50 text-orange-600 border-orange-100")}>{instance.deliveryType}</span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">📍 {instance.location}</p>
                </div>
                <h3 className={cn("font-black tracking-tight leading-none transition-colors", historic ? "text-2xl text-slate-400" : "text-4xl text-slate-900 group-hover:text-indigo-600")}>{instance.courseId?.title}</h3>
                <div className="flex flex-wrap gap-2">
                    {instance.trainerIds?.map((t: any) => (
                        <span key={t._id} className="text-[9px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 uppercase tracking-tighter">{t.name}</span>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-3 min-w-[180px] w-full md:w-auto">
                <Link
                    href={`/dashboard/instances/${instance._id}/roster`}
                    style={{ backgroundColor: brandColor }}
                    className="px-8 py-3.5 text-white text-[11px] font-black rounded-2xl text-center shadow-lg hover:opacity-90"
                >
                    Manage Roster
                </Link>
                {!historic && <AutoQuoteButton instanceId={instance._id} />}
                <DeleteButton endpoint={`/api/course-instances/${instance._id}`} />
            </div>
        </div>
    );
}