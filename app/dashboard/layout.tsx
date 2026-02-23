import Link from "next/link";
import { auth, signOut } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Settings from "@/models/Settings";

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Fetch dynamic branding configuration
    await dbConnect();
    const settings = await Settings.findOne({}).lean() || {};

    const brandColor = settings.primaryColor || "#2563EB";
    const logoUrl = settings.logoUrl || null;
    const companyName = settings.companyName || "ATO Engine";

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Dynamic CSS Variables injected into the head */}
            <style>{`
        :root {
          --brand-primary: ${brandColor};
          --brand-primary-light: ${brandColor}20; /* 20% opacity hex for backgrounds */
        }
      `}</style>

            {/* Sidebar Navigation */}
            <aside className="w-64 border-r bg-white p-6 shadow-sm flex flex-col justify-between hidden md:flex shrink-0">
                <div>
                    {/* Dynamic Logo Rendering */}
                    <div className="mb-8 h-12 flex items-center">
                        {logoUrl ? (
                            <img src={logoUrl} alt={companyName} className="max-h-full max-w-full object-contain" />
                        ) : (
                            <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--brand-primary)' }}>
                                {companyName}
                            </h2>
                        )}
                    </div>

                    <nav className="flex flex-col space-y-1">
                        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">Core</p>
                        <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            Overview
                        </Link>

                        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Operations</p>
                        <Link
                            href="/dashboard/quotes/new"
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                            style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}
                        >
                            Generate Quote
                        </Link>
                        <Link href="/dashboard/quotes" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            All Quotes
                        </Link>
                        <Link href="/dashboard/instances" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            Schedule / Instances
                        </Link>

                        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Database Registry</p>
                        <Link href="/dashboard/organisations" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            Clients (Orgs)
                        </Link>
                        <Link href="/dashboard/delegates" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            Delegates
                        </Link>
                        <Link href="/dashboard/courses" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            Course Catalog
                        </Link>
                        <Link href="/dashboard/trainers" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            Trainers
                        </Link>

                        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">System</p>
                        <Link href="/dashboard/settings" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            Settings & Rates
                        </Link>
                    </nav>
                </div>

                {/* User Profile & Logout */}
                <div className="border-t border-gray-100 pt-4 mt-8">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                        {session?.user?.name}
                    </p>
                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/" });
                        }}
                    >
                        <button type="submit" className="text-sm text-red-600 hover:text-red-700 mt-2 font-medium">
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 md:p-12 overflow-y-auto w-full">
                {children}
            </main>
        </div>
    );
}