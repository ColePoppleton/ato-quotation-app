import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import CourseInstance from '@/models/CourseInstance';

export async function DELETE(request: Request, { params }: { params: { id: string, bookingId: string } }) {
    await dbConnect();
    try {
        await CourseInstance.findByIdAndUpdate(params.id, {
            $pull: { bookings: { _id: params.bookingId } }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}