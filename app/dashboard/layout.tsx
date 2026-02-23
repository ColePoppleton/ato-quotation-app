import Link from "next/link";
import { auth, signOut } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { cn } from "@/lib/utils";

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
                }
            `}</style>

            <aside className="w-64 border-r border-slate-200 bg-white flex flex-col hidden md:flex shrink-0">
                <div className="p-6">
                    <div className="mb-10 h-10 flex items-center px-2">
                        {logoUrl ? (
                            <img src={logoUrl} alt={companyName} className="max-h-full object-contain" />
                        ) : (
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                {companyName}<span className="text-[var(--brand-primary)]">.</span>
                            </h2>
                        )}
                    </div>

                    <nav className="space-y-1.5">
                        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Main Menu</p>
                        <NavLink href="/dashboard" label="Overview" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />

                        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-8">Operations</p>
                        <NavLink href="/dashboard/quotes/new" label="New Quote" highlight />
                        <NavLink href="/dashboard/quotes" label="Quotations" />
                        <NavLink href="/dashboard/instances" label="Schedules" />

                        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-8">Registry</p>
                        <NavLink href="/dashboard/organisations" label="Clients" />
                        <NavLink href="/dashboard/delegates" label="Delegates" />
                        <NavLink href="/dashboard/trainers" label="Trainers" />
                        <NavLink href="/dashboard/courses" label="Catalog" />
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-100 bg-slate-50/50">
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mb-4">
                        Settings
                    </Link>
                    <div className="flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{session?.user?.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">Administrator</p>
                        </div>
                        <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                            <button type="submit" className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            <main className="flex-1 p-10 overflow-y-auto">{children}</main>
        </div>
    );
}

function NavLink({ href, label, highlight = false }: { href: string, label: string, highlight?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all",
                highlight
                    ? "bg-[var(--brand-primary)] text-white shadow-lg shadow-blue-200 hover:opacity-90"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
        >
            {label}
        </Link>
    );
}