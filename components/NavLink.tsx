"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NavLink({
                                    href,
                                    label,
                                    icon,
                                    highlight = false
                                }: {
    href: string,
    label: string,
    icon?: string,
    highlight?: boolean
}) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-200 group",
                highlight
                    ? "bg-[var(--brand-primary)] text-white shadow-xl shadow-[var(--brand-primary-light)] hover:scale-[1.02] active:scale-95"
                    : isActive
                        ? "bg-[var(--brand-primary-light)] text-[var(--brand-primary)]"
                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
            )}
        >
            {icon ? (
                <svg className={cn(
                    "w-5 h-5 mr-3 shrink-0 transition-colors",
                    highlight ? "text-white" : isActive ? "text-[var(--brand-primary)]" : "text-slate-300 group-hover:text-slate-600"
                )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon} />
                </svg>
            ) : highlight && (
                <span className="mr-3 text-lg leading-none">+</span>
            )}
            <span className="truncate tracking-tight">{label}</span>
            {isActive && !highlight && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
            )}
        </Link>
    );
}