import { signIn } from "@/auth";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";

export default function LandingPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white p-6 md:p-20 font-sans">
            <AnimatedGridPattern
                numSquares={60}
                maxOpacity={0.15}
                duration={3}
                repeatDelay={1}
                className={cn(
                    "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
                    "inset-x-0 inset-y-[-20%] h-[140%] -skew-y-12"
                )}
            />

            <div className="z-10 flex flex-col items-center space-y-12 text-center max-w-5xl">
                <div className="space-y-8">
                    <div className="flex justify-center">
                        <span className="inline-block px-6 py-2 text-[10px] font-black tracking-[0.4em] uppercase text-slate-900 bg-slate-100 border-2 border-slate-200 rounded-full">
                            Internal ATO Portal
                        </span>
                    </div>
                    <h1 className="text-7xl md:text-[9.5rem] font-black tracking-tighter text-slate-900 leading-[0.8] mb-4">
                        ATO<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-blue-400 uppercase">
                            Engine.
                        </span>
                    </h1>
                    <p className="text-2xl text-slate-400 max-w-2xl mx-auto font-bold leading-tight tracking-tight">
                        Streamlining course coordination, learner logistics, and financial reporting for modern training organizations.
                    </p>
                </div>

                <form action={async () => { "use server"; await signIn("microsoft-entra-id", { redirectTo: "/dashboard" }); }}>
                    <button type="submit" className="group flex items-center gap-6 rounded-[2rem] bg-slate-900 px-12 py-6 text-2xl font-black text-white shadow-2xl transition-all hover:scale-[1.03] active:scale-95">
                        Access Control Center
                        <span className="transition-transform group-hover:translate-x-2 text-indigo-400">→</span>
                    </button>
                </form>
            </div>
        </div>
    );
}