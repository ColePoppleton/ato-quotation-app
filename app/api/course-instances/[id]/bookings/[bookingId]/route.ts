import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import CourseInstance from '@/models/CourseInstance';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, bookingId: string }> }) {
    await dbConnect();
    try {
        // ✅ Await params to unwrap both id and bookingId
        const { id, bookingId } = await params;
        await CourseInstance.findByIdAndUpdate(id, {
            $pull: { bookings: { _id: bookingId } }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}