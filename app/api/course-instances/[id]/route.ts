import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import CourseInstance from '@/models/CourseInstance';
import Course from '@/models/Course';
import Delegate from '@/models/Delegate';
import Organisation from '@/models/Organisation';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        // ✅ The FIX: Unwrapping params before use
        const { id } = await params;

        const instance = await CourseInstance.findById(id)
            .populate({ path: 'courseId', model: Course })
            .populate({
                path: 'bookings.delegateId',
                model: Delegate,
                populate: { path: 'organisationId', model: Organisation }
            })
            .lean();

        if (!instance) return NextResponse.json({ error: "Instance not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: instance });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        await CourseInstance.findByIdAndDelete(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete instance" }, { status: 500 });
    }
}