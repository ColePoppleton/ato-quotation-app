import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import CourseInstance from '@/models/Organisation';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        await CourseInstance.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}