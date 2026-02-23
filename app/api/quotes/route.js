import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Quote from '@/models/Quote';
import { auth } from '@/auth';
import { z } from 'zod';

const QuotePayloadSchema = z.object({
    organisationId: z.string(),
    courseInstanceId: z.string(),
    delegateCount: z.number().min(1),
    includesExam: z.boolean().refine(val => val === true, {
        message: "Exam inclusion is mandatory for this course type"
    })
});

export async function POST(request) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        const validatedData = QuotePayloadSchema.parse(body);

        await dbConnect();

        const newQuote = new Quote({
            organisationId: validatedData.organisationId,
            courseInstanceId: validatedData.courseInstanceId,
            delegateCount: validatedData.delegateCount,
        });

        await newQuote.save();

        return NextResponse.json({ success: true, quote: newQuote }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Invalid quotation payload or database error" }, { status: 400 });
    }
}