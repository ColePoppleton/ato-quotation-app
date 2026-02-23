"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Course { _id: string; title: string; }
interface Trainer { _id: string; name: string; }

export default function NewInstancePage() {
    const router = useRouter();
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedTrainerId, setSelectedTrainerId] = useState("");
    const [deliveryType, setDeliveryType] = useState("virtual");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [courses, setCourses] = useState<Course[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [courseRes, trainerRes] = await Promise.all([
                fetch('/api/courses'), fetch('/api/trainers')
            ]);
            const courseData = await courseRes.json();
            const trainerData = await trainerRes.json();
            if (courseData.success) setCourses(courseData.data);
            if (trainerData.success) setTrainers(trainerData.data);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const handleCreateInstance = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/course-instances', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseId: selectedCourseId,
                trainerIds: [selectedTrainerId],
                deliveryType, startDate, endDate
            }),
        });
        router.push("/dashboard");
    };

    return (
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-10 shadow-sm">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Schedule Training Instance</h2>
            <form onSubmit={handleCreateInstance} className="space-y-6">

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Master Course</label>
                        <select required value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} disabled={isLoading} className="w-full border p-3 rounded-lg">
                            <option value="" disabled>Select Course</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Primary Trainer</label>
                        <select required value={selectedTrainerId} onChange={(e) => setSelectedTrainerId(e.target.value)} disabled={isLoading} className="w-full border p-3 rounded-lg">
                            <option value="" disabled>Select Trainer</option>
                            {trainers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Start Date</label>
                        <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border p-3 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">End Date</label>
                        <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border p-3 rounded-lg" />
                    </div>
                </div>

                <button type="submit" className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl">Schedule Instance</button>
            </form>
        </div>
    );
}