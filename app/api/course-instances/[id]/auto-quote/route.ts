import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import CourseInstance from '@/models/CourseInstance';
import Delegate from '@/models/Delegate';
import Quote from '@/models/Quote';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();

    try {
        const { id } = await params;

        const instance = await CourseInstance.findById(id).lean();
        if (!instance) return NextResponse.json({ error: "Instance not found" }, { status: 404 });

        // 1. Get delegate IDs from the instance bookings
        const delegateIds = instance.bookings?.map((b: any) => b.delegateId).filter(Boolean) || [];

        if (delegateIds.length === 0) {
            return NextResponse.json({ success: true, generated: 0, message: "No delegates found on roster." });
        }

        // 2. Fetch the actual Delegate objects
        const delegateDetails = await Delegate.find({ _id: { $in: delegateIds } }).lean();

        // 3. Group the full delegate objects by Organisation
        // We use an array to store the objects instead of just a counter
        const delegatesByOrg: Record<string, any[]> = {};

        delegateDetails.forEach(delegate => {
            if (delegate.organisationId) {
                const orgId = delegate.organisationId.toString();
                if (!delegatesByOrg[orgId]) delegatesByOrg[orgId] = [];

                // Find if the original enrollment had "includesBook" set
                const originalBooking = instance.bookings.find(
                    (b: any) => b.delegateId.toString() === delegate._id.toString()
                );

                // Push the specific fields required by the Quote schema
                delegatesByOrg[orgId].push({
                    firstName: delegate.firstName,
                    lastName: delegate.lastName,
                    email: delegate.email,
                    wantsMaterials: originalBooking?.includesBook || false, // Carry over preference
                    wantsTake2: false // Default to false for new quotes
                });
            }
        });

        let newQuotesCount = 0;

        // 4. Create Drafts using the grouped delegate arrays
        for (const [orgId, orgDelegates] of Object.entries(delegatesByOrg)) {
            const count = orgDelegates.length;
            const basePrice = count * (instance.pricePerDelegate || 1000);
            const examFees = count * 250;

            await Quote.create({
                organisationId: orgId,
                courseInstanceId: instance._id,
                delegates: orgDelegates, // Now passing the full list of names
                delegateCount: count,
                status: 'draft',
                financials: {
                    basePrice,
                    examFees,
                    travelCost: 0,
                    accommodationCost: 0,
                    totalPrice: basePrice + examFees
                }
            });
            newQuotesCount++;
        }

        return NextResponse.json({ success: true, generated: newQuotesCount });
    } catch (error: any) {
        console.error("Auto-Quote Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}