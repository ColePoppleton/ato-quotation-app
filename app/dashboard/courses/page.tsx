import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/mongodb";
import Course from "@/models/Course";

export default async function CoursesPage() {
    const session = await auth();
    if (!session) redirect("/");

    await dbConnect();
    const courses = await Course.find({}).sort({ title: 1 }).lean();

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Course Catalog</h1>
                    <p className="text-gray-500 mt-1">Master definitions for training programs.</p>
                </div>
                <Link href="/dashboard/courses/new" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    + Add Course
                </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
                    <tr>
                        <th className="px-6 py-4 font-semibold tracking-wider">Title</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Exam Body</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Mandatory Exam</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {courses.length === 0 ? (
                        <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No courses defined.</td></tr>
                    ) : (
                        courses.map((course: any) => (
                            <tr key={course._id.toString()} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{course.title}</td>
                                <td className="px-6 py-4">{course.examBody}</td>
                                <td className="px-6 py-4">
                                    {course.requiresExam ?
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Yes</span> :
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase">No</span>
                                    }
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}