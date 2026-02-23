"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AutoQuoteButton({ instanceId }: { instanceId: string }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();

    const handleAutoQuote = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch(`/api/course-instances/${instanceId}/auto-quote`, {
                method: 'POST'
            });
            const data = await res.json();

            if (data.success) {
                alert(`Successfully generated ${data.generated} draft quotes!`);
                router.push('/dashboard/quotes'); // Take user to see the new drafts
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            alert("Failed to generate quotes.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleAutoQuote}
            disabled={isGenerating}
            className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md font-bold hover:bg-indigo-100 disabled:opacity-50"
        >
            {isGenerating ? "Processing..." : "Auto-Quote"}
        </button>
    );
}