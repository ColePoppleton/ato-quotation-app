import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import CourseInstance from '@/models/Organisation';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        // ✅ Await params to unwrap the id
        const { id } = await params;
        await CourseInstance.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}