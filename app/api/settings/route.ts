import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function GET() {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({});
    }
    return NextResponse.json({ success: true, data: settings });
}

export async function PATCH(request: Request) {
    await dbConnect();
    const body = await request.json();
    const settings = await Settings.findOneAndUpdate({}, { $set: body }, { new: true, upsert: true });
    return NextResponse.json({ success: true, data: settings });
}