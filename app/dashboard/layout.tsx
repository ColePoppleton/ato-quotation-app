import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Sidebar Navigation */}
            <aside className="w-64 border-r bg-white p-6 shadow-sm flex flex-col justify-between hidden md:flex">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-blue-900 mb-8">
                        ATO Engine
                    </h2>
                    <nav className="flex flex-col space-y-2">
                        <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            Overview
                        </Link>
                        <Link href="/dashboard/quotes/new" className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg transition-colors">
                            Generate Quote
                        </Link>
                        <Link href="/dashboard/courses" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            Course Catalog
                        </Link>
                        <Link href="/dashboard/instances" className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                            Scheduled Instances
                        </Link>
                    </nav>
                </div>

                {/* User Profile & Logout */}
                <div className="border-t pt-4">
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
            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}