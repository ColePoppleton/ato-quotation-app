import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import CourseInstance from '@/models/CourseInstance';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params; // ✅ The Fix: Unwrapping the promise
        const { delegateId, attended } = await request.json();

        const updatedInstance = await CourseInstance.findOneAndUpdate(
            { _id: id, "bookings.delegateId": delegateId },
            { $set: { "bookings.$.attended": attended } },
            { returnDocument: 'after' } // ✅ Fixes the Mongoose warning
        );

        if (!updatedInstance) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}