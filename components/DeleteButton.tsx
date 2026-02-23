"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ endpoint }: { endpoint: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            await fetch(endpoint, { method: "DELETE" });
            router.refresh(); // Automatically forces the dashboard tables to instantly update!
        } catch (err) {
            alert("Failed to delete record.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button onClick={handleDelete} disabled={isDeleting} className="text-red-600 hover:text-red-800 font-bold text-sm transition-colors disabled:opacity-50">
            {isDeleting ? "..." : "Delete"}
        </button>
    );
}