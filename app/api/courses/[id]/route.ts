import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Course from '@/models/Course'; // ✅ FIX: Import Course, not CourseInstance

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        await Course.findByIdAndDelete(params.id); // ✅ FIX: Use Course model
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}