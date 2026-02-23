import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Quote from '@/models/Quote';
import { auth } from '@/auth';

export async function POST(request: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        await dbConnect();
        const newQuote = await Quote.create(body);

        return NextResponse.json({ success: true, data: newQuote }, { status: 201 });
    } catch (error: any) {
        console.error("Quote Generation Error:", error);
        return NextResponse.json({ error: error.message || "Failed to save quote to database" }, { status: 400 });
    }
}