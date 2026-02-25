import Link from "next/link";
import { auth, signOut } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { cn } from "@/lib/utils";
import NavLink from "@/components/NavLink"; // Move NavLink to a client component for active states

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    await dbConnect();
    const settings = await Settings.findOne({}).lean() || {};

    const brandColor = settings.primaryColor || "#2563EB";
    const logoUrl = settings.logoUrl || null;
    const companyName = settings.companyName || "ATO Engine";

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <style>{`
                :root {
                  --brand-primary: ${brandColor};
                  --brand-primary-light: ${brandColor}15;
                  --brand-primary-hover: ${brandColor}dd;
                }
            `}</style>

            <aside className="w-72 border-r border-slate-200 bg-white flex flex-col hidden md:flex shrink-0 sticky top-0 h-screen">
                {/* Brand Identity Section */}
                <div className="p-8">
                    <div className="mb-12 h-12 flex items-center px-2">
                        {logoUrl ? (
                            <img src={logoUrl} alt={companyName} className="max-h-full object-contain" />
                        ) : (
                            <h2 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">
                                {companyName.toUpperCase()}<span className="text-[var(--brand-primary)]">.</span>
                            </h2>
                        )}
                    </div>

                    <nav className="space-y-8">
                        <div>
                            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Intelligence</p>
                            <div className="space-y-1">
                                <NavLink href="/dashboard" label="Overview" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                <NavLink href="/dashboard/analytics" label="Reports" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </div>
                        </div>

                        <div>
                            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Operations</p>
                            <div className="space-y-1">
                                <NavLink href="/dashboard/quotes/new" label="New Quote" highlight />
                                <NavLink href="/dashboard/quotes" label="Quotations" icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                <NavLink href="/dashboard/instances" label="Schedules" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </div>
                        </div>

                        <div>
                            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Registry</p>
                            <div className="space-y-1">
                                <NavLink href="/dashboard/organisations" label="Clients" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                <NavLink href="/dashboard/delegates" label="Learners" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                <NavLink href="/dashboard/trainers" label="Instructors" icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                <NavLink href="/dashboard/courses" label="Catalog" icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </div>
                        </div>
                    </nav>
                </div>

                {/* Bottom Profile Section */}
                <div className="mt-auto p-8 border-t border-slate-100 bg-slate-50/30">
                    <Link href="/dashboard/settings" className="group flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all mb-6">
                        <span className="group-hover:rotate-45 transition-transform duration-500">⚙️</span>
                        Settings
                    </Link>
                    <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate tracking-tight">{session?.user?.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admin Access</p>
                        </div>
                        <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                            <button type="submit" className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                <div className="p-12 min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}