import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import CourseInstance from '@/models/CourseInstance';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params; // ✅ Unwrapping the promise
        const { delegateId } = await request.json();

        const updatedInstance = await CourseInstance.findByIdAndUpdate(
            id,
            { $push: { bookings: { delegateId, attended: false } } },
            { returnDocument: 'after' } // ✅ Silencing the Mongoose warning
        );

        return NextResponse.json({ success: true, data: updatedInstance });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}