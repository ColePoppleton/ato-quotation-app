import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { dbConnect } from "@/lib/mongodb";
import Settings from "@/models/Settings";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// DYNAMIC METADATA: This function runs on the server to fetch your brand logo
export async function generateMetadata(): Promise<Metadata> {
    await dbConnect(); //

    // Fetch the settings from your database
    const settings = await Settings.findOne({}).lean() || {};

    const companyName = (settings as any).companyName || "ATO Engine";
    const logoUrl = (settings as any).logoUrl || "/favicon.ico"; // Fallback to local favicon

    return {
        title: companyName,
        description: "Enterprise Training Management Portal",
        icons: {
            icon: logoUrl,    // Sets the browser tab favicon
            shortcut: logoUrl,
            apple: logoUrl,
        },
    };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        </body>
        </html>
    );
}