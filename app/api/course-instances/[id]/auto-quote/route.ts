import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import CourseInstance from '@/models/CourseInstance';
import Delegate from '@/models/Delegate';
import Quote from '@/models/Quote';
import Course from '@/models/Course'; // Ensure Course is imported for population

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect(); //

    try {
        const { id } = await params;

        // Fetch the instance and populate the master course to get live pricing data
        const instance = await CourseInstance.findById(id).populate('courseId').lean();
        if (!instance) return NextResponse.json({ error: "Instance not found" }, { status: 404 });

        const courseMaster = instance.courseId as any; // The master financial blueprint

        // 1. Get delegate IDs from the instance bookings
        const delegateIds = instance.bookings?.map((b: any) => b.delegateId).filter(Boolean) || [];

        if (delegateIds.length === 0) {
            return NextResponse.json({ success: true, generated: 0, message: "No delegates found on roster." });
        }

        // 2. Fetch the actual Delegate objects
        const delegateDetails = await Delegate.find({ _id: { $in: delegateIds } }).lean();

        // 3. Group the full delegate objects by Organisation and carry over preferences
        const delegatesByOrg: Record<string, any[]> = {};

        delegateDetails.forEach(delegate => {
            if (delegate.organisationId) {
                const orgId = delegate.organisationId.toString();
                if (!delegatesByOrg[orgId]) delegatesByOrg[orgId] = [];

                // Find if the original enrollment on the roster had "includesBook" set
                const originalBooking = instance.bookings.find(
                    (b: any) => b.delegateId.toString() === delegate._id.toString()
                );

                delegatesByOrg[orgId].push({
                    firstName: delegate.firstName,
                    lastName: delegate.lastName,
                    email: delegate.email,
                    wantsMaterials: originalBooking?.includesBook || false,
                    wantsTake2: false
                });
            }
        });

        let newQuotesCount = 0;

        // 4. Create Drafts using live pricing from the Course Catalog
        for (const [orgId, orgDelegates] of Object.entries(delegatesByOrg)) {
            const count = orgDelegates.length;

            // Calculate totals based on Course Catalog settings
            const basePrice = count * (courseMaster.costPerEnrollment || 0);
            const examFees = courseMaster.requiresExam ? (count * (courseMaster.examCost || 0)) : 0;

            // Only charge materials cost for delegates who specifically want them
            const trainingMaterialsCost = orgDelegates.reduce((sum, d) => {
                return sum + (d.wantsMaterials ? (courseMaster.materialsCost || 0) : 0);
            }, 0);

            await Quote.create({
                organisationId: orgId,
                courseInstanceId: instance._id,
                delegates: orgDelegates,
                delegateCount: count,
                status: 'draft',
                financials: {
                    basePrice,
                    examFees,
                    trainingMaterialsCost,
                    travelCost: 0,
                    accommodationCost: 0,
                    take2Cost: 0,
                    totalPrice: basePrice + examFees + trainingMaterialsCost
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