import type { Metadata } from "next";
import {Geist, Geist_Mono, Inter} from "next/font/google";
import "./globals.css";
import { dbConnect } from "@/lib/mongodb";
import Settings from "@/models/Settings";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// DYNAMIC METADATA: Syncs favicon with Settings logo
export async function generateMetadata(): Promise<Metadata> {
    await dbConnect();
    const settings = await Settings.findOne({}).lean() || {};
    const companyName = settings.companyName || "ATO Engine";
    const logoUrl = settings.logoUrl || "/favicon.ico";

    return {
        title: companyName,
        description: "Enterprise Training Management Portal",
        icons: {
            icon: logoUrl,
            shortcut: logoUrl,
            apple: logoUrl,
        },
    };
}

// app/layout.tsx snippet
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        </body>
        </html>
    );
}