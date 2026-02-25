import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Quote from '@/models/Quote';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        // ✅ Await params to unwrap the id
        const { id } = await params;
        const { status } = await request.json();
        const updatedQuote = await Quote.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        return NextResponse.json({ success: true, data: updatedQuote });
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}