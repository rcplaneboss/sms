"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/LinkAsButton";
import { ArrowRight, Users, BookOpen, CheckCircle } from "lucide-react";

// Placeholder types for data received from the API
interface Teacher {
    id: string;
    name: string | null;
    email: string;
}

interface Program {
    name: string;
    level: { name: string };
}

interface Course {
    id: string;
    name: string;
    subject: { name: string };
    programs: Program[];
}

const AdminAssignmentPage = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAssigning, setIsAssigning] = useState(false);
    
    // State for user selections
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState("");

    // State for selected objects for display (improves UX)
    const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
    const selectedCourse = courses.find(c => c.id === selectedCourseId);

    // 1. Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/admin-assign");
                if (!res.ok) throw new Error("Failed to fetch assignment data.");
                const data = await res.json();
                
                setTeachers(data.teachers || []);
                setCourses(data.courses || []);
                
                // Set defaults if data exists
                if (data.teachers.length > 0) setSelectedTeacherId(data.teachers[0].id);
                if (data.courses.length > 0) setSelectedCourseId(data.courses[0].id);

            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load teachers or courses.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 2. Assignment Logic
    const handleAssignment = async () => {
        if (!selectedTeacherId || !selectedCourseId) {
            toast.warning("Please select both a Teacher and a Course.");
            return;
        }

        setIsAssigning(true);
        const toastId = toast.loading("Assigning course...");

        try {
            const res = await fetch("/api/admin/assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teacherId: selectedTeacherId,
                    courseId: selectedCourseId,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to assign course.");
            }

            toast.success("Course assigned successfully!", { id: toastId });

        } catch (error) {
            console.error("Assignment Error:", error);
            toast.error(error.message, { id: toastId });
        } finally {
            setIsAssigning(false);
        }
    };

    // 3. Loading State Renderer
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
                <div className="text-center p-10">
                    <div className="animate-spin inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Loading assignment data...</p>
                </div>
            </div>
        );
    }
    
    // 4. No Data State
    if (teachers.length === 0 || courses.length === 0) {
        return (
            <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-lg">
                    <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">
                        Data Missing
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {teachers.length === 0 && (
                            <span>No onboarded teachers found. Teachers must complete the acceptance page before being assigned courses.</span>
                        )}
                        {courses.length === 0 && teachers.length > 0 && (
                            <span>No courses are currently available in the database to assign.</span>
                        )}
                        {teachers.length === 0 && courses.length === 0 && (
                            <span>No teachers or courses found. Please ensure teachers have completed onboarding and courses are defined.</span>
                        )}
                    </p>
                </div>
            </div>
        );
    }

    // 5. Main Component Rendering
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8 transition-colors duration-300">
            <Toaster />
            <div className="max-w-4xl mx-auto">
                <header className="py-6 mb-8 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                        Course Assignment Center
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                        Link onboarded teachers to available courses.
                    </p>
                </header>

                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-8">
                    {/* SELECTION PANELS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Teacher Selection */}
                        <div>
                            <label htmlFor="teacher-select" className="flex items-center text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <Users className="w-5 h-5 mr-2 text-indigo-500" />
                                Select Teacher
                            </label>
                            <select
                                id="teacher-select"
                                value={selectedTeacherId}
                                onChange={(e) => setSelectedTeacherId(e.target.value)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                            >
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name || teacher.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Course Selection */}
                        <div>
                            <label htmlFor="course-select" className="flex items-center text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                <BookOpen className="w-5 h-5 mr-2 text-green-500" />
                                Select Course
                            </label>
                            <select
                                id="course-select"
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                            >
                                {courses.map((course) => {
                                    // Helper to display a clear course description
                                    const programInfo = course.programs[0];
                                    const details = programInfo 
                                        ? ` (${programInfo.level.name} - ${programInfo.name})`
                                        : '';
                                    return (
                                        <option key={course.id} value={course.id}>
                                            {course.name} - {course.subject.name}{details}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                    
                    {/* ASSIGNMENT PREVIEW */}
                    <div className="p-4 sm:p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700">
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 flex items-center">
                            <ArrowRight className="w-5 h-5 mr-2 text-yellow-500" />
                            Assignment Preview
                        </h3>
                        {selectedTeacher && selectedCourse ? (
                            <div className="text-lg text-gray-700 dark:text-gray-200">
                                <p className="mb-2">
                                    <span className="font-semibold text-indigo-500">Teacher:</span> {selectedTeacher.name || selectedTeacher.email}
                                </p>
                                <p>
                                    <span className="font-semibold text-green-500">Course:</span> {selectedCourse.name} - {selectedCourse.subject.name}
                                </p>
                                {selectedCourse.programs[0] && (
                                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                         Level: {selectedCourse.programs[0].level.name}, Program: {selectedCourse.programs[0].name}
                                     </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">
                                Select a teacher and a course to see the assignment preview.
                            </p>
                        )}
                    </div>


                    {/* SUBMIT BUTTON */}
                    <div className="pt-4">
                        <Button
                            onClick={handleAssignment}
                            variant="primary"
                            size="lg"
                            withIcon={true}
                            disabled={isAssigning || !selectedTeacherId || !selectedCourseId}
                            className="w-full text-lg"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            {isAssigning ? "Assigning..." : "Confirm Assignment"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAssignmentPage;
