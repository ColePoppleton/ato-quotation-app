"use client";

import { useRouter } from "next/navigation";

// Update interface to include optional 'disabled' boolean
export default function StatusDropdown({
                                           quoteId,
                                           initialStatus,
                                           disabled = false
                                       }: {
    quoteId: string,
    initialStatus: string,
    disabled?: boolean
}) {
    const router = useRouter();

    const handleChange = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/quotes/${quoteId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                router.refresh(); // Refreshes the server data to keep charts in sync
            }
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    return (
        <select
            defaultValue={initialStatus}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled} // Apply the disabled state here
            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg p-1 font-bold uppercase cursor-pointer hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending</option>
            <option value="approved">Approved</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
        </select>
    );
}