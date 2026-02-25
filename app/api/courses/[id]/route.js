import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Course from '@/models/Course';
import { revalidatePath } from 'next/cache';

export async function GET(request, { params }) {
    await dbConnect();
    try {
        const { id } = await params;
        const course = await Course.findById(id).lean();
        return NextResponse.json({ success: true, data: course });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await request.json();

        const updatedCourse = await Course.findByIdAndUpdate(id, body, { new: true });

        if (!updatedCourse) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // CRITICAL: Clear the cache so the catalog page shows new data
        revalidatePath('/dashboard/courses');

        return NextResponse.json({ success: true, data: updatedCourse });
    } catch (error) {
        return NextResponse.json({ error: "Update failed", details: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    await dbConnect();
    try {
        const { id } = await params;
        await Course.findByIdAndDelete(id);

        revalidatePath('/dashboard/courses');

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}