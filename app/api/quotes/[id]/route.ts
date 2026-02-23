import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Quote from '@/models/Quote';
import Organisation from '@/models/Organisation';
import CourseInstance from '@/models/CourseInstance';
import Course from '@/models/Course';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        // Populate organisation and course info so the edit page can display labels
        const quote = await Quote.findById(id)
            .populate('organisationId', 'name')
            .populate({
                path: 'courseInstanceId',
                populate: { path: 'courseId', model: Course, select: 'title' }
            })
            .lean();

        if (!quote) {
            return NextResponse.json({ error: "Quote not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: quote });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        await Quote.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await request.json();
        const updated = await Quote.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}