import { signIn } from "@/auth";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";

export default function LandingPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-50 p-6 md:p-20">
            <AnimatedGridPattern
                numSquares={40}
                maxOpacity={0.1}
                duration={4}
                repeatDelay={0.5}
                className={cn(
                    "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
                    "inset-x-0 inset-y-[-20%] h-[140%] -skew-y-6"
                )}
            />

            <div className="z-10 flex flex-col items-center space-y-10 text-center max-w-4xl">
                <div className="space-y-6">
                    <span className="inline-block px-4 py-1.5 mb-2 text-xs font-bold tracking-[0.2em] uppercase text-blue-600 bg-blue-50 border border-blue-100 rounded-full">
                        Enterprise Training Management
                    </span>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9]">
                        Quote & Schedule <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-400">
                            With Precision.
                        </span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
                        The unified internal portal for ATO operations. Streamline delegate booking, financial reporting, and course coordination.
                    </p>
                </div>

                <form action={async () => { "use server"; await signIn("microsoft-entra-id", { redirectTo: "/dashboard" }); }}>
                    <button type="submit" className="group flex items-center gap-4 rounded-3xl bg-slate-900 px-10 py-5 text-xl font-bold text-white shadow-2xl transition-all hover:scale-[1.02] hover:bg-black">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
                        </svg>
                        Access Portal
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                    </button>
                </form>
            </div>
        </div>
    );
}