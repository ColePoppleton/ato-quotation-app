import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import CourseInstance from '@/models/CourseInstance';
import mongoose from 'mongoose';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const { delegateId, attended } = await request.json();

        // Use positional operator to update specific booking
        const updatedInstance = await CourseInstance.findOneAndUpdate(
            {
                _id: id,
                "bookings.delegateId": new mongoose.Types.ObjectId(delegateId)
            },
            { $set: { "bookings.$.attended": attended } },
            { new: true }
        );

        if (!updatedInstance) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}