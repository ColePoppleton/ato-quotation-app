import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import CourseInstance from '@/models/CourseInstance';
import Delegate from '@/models/Delegate';
import Quote from '@/models/Quote';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();

    try {
        const { id } = await params;

        // 1. Fetch the instance and populate the bookings
        const instance = await CourseInstance.findById(id).lean();
        if (!instance) return NextResponse.json({ error: "Instance not found" }, { status: 404 });

        // 2. IMPORTANT: We look inside 'bookings' array, not 'bookedDelegates'
        // We filter out any booking that doesn't have a delegateId
        const delegateIds = instance.bookings?.map((b: any) => b.delegateId).filter(Boolean) || [];

        if (delegateIds.length === 0) {
            return NextResponse.json({ success: true, generated: 0, message: "No delegates found on roster." });
        }

        // 3. Fetch the actual Delegate objects to get their Organisation IDs
        const delegates = await Delegate.find({ _id: { $in: delegateIds } }).lean();

        // 4. Group by Organisation
        const delegatesByOrg: Record<string, number> = {};
        delegates.forEach(delegate => {
            if (delegate.organisationId) {
                const orgId = delegate.organisationId.toString();
                delegatesByOrg[orgId] = (delegatesByOrg[orgId] || 0) + 1;
            }
        });

        let newQuotesCount = 0;

        // 5. Create Drafts
        for (const [orgId, count] of Object.entries(delegatesByOrg)) {
            const basePrice = count * (instance.pricePerDelegate || 1000);
            const examFees = count * 250;

            await Quote.create({
                organisationId: orgId,
                courseInstanceId: instance._id,
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