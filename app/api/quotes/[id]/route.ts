// app/api/quotes/[id]/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Quote from '@/models/Quote';
import { auth } from '@/auth';

// GET: Fetch a single specific quote by its ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        const { id } = params;

        const quote = await Quote.findById(id)
            .populate('organisationId', 'name contactEmail')
            .populate({
                path: 'courseInstanceId',
                populate: { path: 'courseId', select: 'title requiresExam' }
            });

        if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

        return NextResponse.json({ success: true, data: quote }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
    }
}

// PATCH: Update a specific quote (e.g., changing status to "approved")
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        const { id } = params;
        const body = await request.json();

        // { new: true } ensures Mongoose returns the updated document, not the old one
        // runValidators: true ensures your minimum delegate rules are still checked on update
        const updatedQuote = await Quote.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedQuote) {
            return NextResponse.json({ error: "Quote not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedQuote }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update quote", details: error.message }, { status: 400 });
    }
}

// DELETE: Remove a quote from the database
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();

    // Optional: Restrict deletions to admin/manager roles only
    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id } = params;

        const deletedQuote = await Quote.findByIdAndDelete(id);

        if (!deletedQuote) {
            return NextResponse.json({ error: "Quote not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Quote deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
    }
}