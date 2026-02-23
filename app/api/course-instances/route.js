import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import CourseInstance from '@/models/CourseInstance';

import Course from '@/models/Course';
import Trainer from '@/models/Trainer';
import { auth } from '@/auth';

export async function GET(request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();

        const instances = await CourseInstance.find({})
            .populate({
                path: 'courseId',
                model: Course,
                select: 'title'
            })
            .populate({
                path: 'trainerIds',
                model: Trainer,
                select: 'name'
            })
            .sort({ startDate: 1 });

        return NextResponse.json({ success: true, data: instances }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch course instances:", error);
        return NextResponse.json({ error: "Failed to fetch course instances" }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        await dbConnect();

        const newInstance = await CourseInstance.create(body);
        return NextResponse.json({ success: true, data: newInstance }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create course instance", details: error.message }, { status: 400 });
    }
}