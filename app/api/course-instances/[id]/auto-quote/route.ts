import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import CourseInstance from '@/models/CourseInstance';
import Delegate from '@/models/Delegate';
import Quote from '@/models/Quote';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    await dbConnect();

    try {
        const instance = await CourseInstance.findById(params.id);
        if (!instance) return NextResponse.json({ error: "Instance not found" }, { status: 404 });

        // 1. Fetch all delegates booked on this course
        const delegates = await Delegate.find({ _id: { $in: instance.bookedDelegates } });

        // 2. Group them by their Organisation ID
        const delegatesByOrg: Record<string, number> = {};
        delegates.forEach(delegate => {
            if (delegate.organisationId) {
                const orgId = delegate.organisationId.toString();
                delegatesByOrg[orgId] = (delegatesByOrg[orgId] || 0) + 1;
            }
        });

        let newQuotesCount = 0;

        // 3. Generate a draft quote for each organisation
        for (const [orgId, count] of Object.entries(delegatesByOrg)) {
            // Prevent duplicates: Check if a quote already exists for this org + course
            const existingQuote = await Quote.findOne({ organisationId: orgId, courseInstanceId: instance._id });

            if (!existingQuote) {
                const basePrice = count * (instance.pricePerDelegate || 1000);
                const examFees = count * 250;

                await Quote.create({
                    organisationId: orgId,
                    courseInstanceId: instance._id,
                    delegateCount: count,
                    status: 'draft',
                    financials: { basePrice, examFees, travelCost: 0, accommodationCost: 0, totalPrice: basePrice + examFees }
                });
                newQuotesCount++;
            }
        }

        return NextResponse.json({ success: true, generated: newQuotesCount });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}