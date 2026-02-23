import { signIn } from "@/auth";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils"; // Automatically created by shadcn

export default function LandingPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-10">
            {/* Magic UI Animated Background */}
            <AnimatedGridPattern
                numSquares={30}
                maxOpacity={0.1}
                duration={3}
                repeatDelay={1}
                className={cn(
                    "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
                    "inset-x-0 inset-y-[-30%] h-[160%] skew-y-12"
                )}
            />

            {/* Foreground Content */}
            <div className="z-10 flex flex-col items-center space-y-8 text-center bg-white/50 backdrop-blur-md p-12 rounded-3xl border border-gray-200 shadow-2xl max-w-2xl">
                <div className="space-y-4">
                    <h1 className="text-5xl font-extrabold tracking-tighter text-gray-900 sm:text-6xl">
                        ATO Quotation Engine
                    </h1>
                    <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                        Internal portal for managing delegates, generating financial quotes, and organizing course instances securely.
                    </p>
                </div>

                {/* The Server Action that triggers Microsoft Entra ID Login */}
                <form
                    action={async () => {
                        "use server";
                        // The redirectTo prop ensures they land on the dashboard after Microsoft authenticates them
                        await signIn("microsoft-entra-id", { redirectTo: "/dashboard" });
                    }}
                    className="w-full sm:w-auto"
                >
                    <button
                        type="submit"
                        className="group relative flex w-full items-center justify-center gap-3 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.8)] transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-[0_0_60px_-15px_rgba(37,99,235,1)]"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-6 w-6"
                        >
                            <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
                        </svg>
                        Sign in with Office 365
                        <span className="absolute right-4 opacity-0 transition-all group-hover:right-6 group-hover:opacity-100">
              →
            </span>
                    </button>
                </form>
            </div>
        </div>
    );
}