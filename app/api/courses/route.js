import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Course from '@/models/Course'; // Swap this for Trainer, Delegate, etc.
import { auth } from '@/auth';

export async function GET(request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        const records = await Course.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: records }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        await dbConnect();
        const newRecord = await Course.create(body);
        return NextResponse.json({ success: true, data: newRecord }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create record", details: error.message }, { status: 400 });
    }
}