import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Organisation from '@/models/Organisation';
import { auth } from '@/auth';

export async function GET(request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        const organisations = await Organisation.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: organisations }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch organisations" }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        await dbConnect();

        const newOrganisation = await Organisation.create(body);
        return NextResponse.json({ success: true, data: newOrganisation }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create organisation", details: error.message }, { status: 400 });
    }
}