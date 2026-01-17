"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/LinkAsButton";
import { ArrowRight, Users, BookOpen, CheckCircle, Trash2, Loader2, ListOrdered } from "lucide-react";

interface Teacher {
    id: string;
    name: string | null;
    email: string;
}

interface Program {
    id: string;
    name: string;
    level: { name: string };
    track: { name: string };
}

interface Subject {
    id: string;
    name: string;
    description?: string;
    programs: Program[];
}

interface CurrentAssignment {
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    assignments: {
        subject: {
            id: string;
            name: string;
            description?: string;
        };
        program: {
            id: string;
            name: string;
        };
    }[];
}

const AdminAssignmentPage = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [currentAssignments, setCurrentAssignments] = useState<CurrentAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAssigning, setIsAssigning] = useState(false);
    const [deletingAssignment, setDeletingAssignment] = useState<string | null>(null);
    
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [selectedProgramId, setSelectedProgramId] = useState("");

    const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
    const selectedProgram = programs.find(p => p.id === selectedProgramId);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin-assign");
            if (!res.ok) throw new Error("Failed to fetch assignment data.");
            const data = await res.json();
            
            setTeachers(data.teachers || []);
            setSubjects(data.subjects || []);
            setPrograms(data.programs || []);
            setCurrentAssignments(data.currentAssignments || []);
            
            if (data.teachers.length > 0) setSelectedTeacherId(data.teachers[0].id);
            if (data.subjects.length > 0) setSelectedSubjectId(data.subjects[0].id);
            if (data.programs.length > 0) setSelectedProgramId(data.programs[0].id);

        } catch (error) {
            console.error("Error fetching assignment data:", error);
            toast.error("Failed to load teachers, subjects, or current assignments.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignment = async () => {
        if (!selectedTeacherId || !selectedSubjectId || !selectedProgramId) {
            toast.warning("Please select a Teacher, Subject, and Program.");
            return;
        }

        setIsAssigning(true);
        const toastId = toast.loading("Assigning subject...");

        try {
            const res = await fetch("/api/admin-assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teacherId: selectedTeacherId,
                    subjectId: selectedSubjectId,
                    programId: selectedProgramId,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to assign subject.");
            }

            await fetchData();
            toast.success("Subject assigned successfully!", { id: toastId });

        } catch (error) {
            console.error("Assignment Error:", error);
            toast.error(error.message || "Failed to assign subject.", { id: toastId });
        } finally {
            setIsAssigning(false);
        }
    };

    const handleDeleteAssignment = async (teacherId: string, subjectId: string) => {
        const assignmentKey = `${teacherId}-${subjectId}`;
        setDeletingAssignment(assignmentKey);
        const toastId = toast.loading("Unassigning subject...");

        try {
            const res = await fetch("/api/admin-assign", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teacherId,
                    subjectId,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to unassign subject.");
            }

            await fetchData();
            toast.success("Subject unassigned successfully!", { id: toastId });

        } catch (error) {
            console.error("Unassignment Error:", error);
            toast.error(error.message || "Failed to unassign subject.", { id: toastId });
        } finally {
            setDeletingAssignment(null);
        }
    };

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
    
    if (teachers.length === 0 || subjects.length === 0) {
        return (
            <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-lg">
                    <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">
                        Setup Required
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {teachers.length === 0 && (
                            <span>No onboarded teachers found. Teachers must complete the acceptance page before being assigned subjects.</span>
                        )}
                        {subjects.length === 0 && teachers.length > 0 && (
                            <span>No subjects are currently available in the database to assign. Please add subjects.</span>
                        )}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8 transition-colors duration-300">
            <Toaster />
            <div className="max-w-7xl mx-auto">
                <header className="py-6 mb-8 text-center border-b dark:border-gray-800">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                        Subject Assignment Center
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                        Link teachers to subjects and manage existing assignments.
                    </p>
                </header>

                <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl mb-12">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                        <ArrowRight className="w-5 h-5 mr-3 text-indigo-500" />
                        Create New Assignment
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="teacher-select" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
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

                        <div>
                            <label htmlFor="subject-select" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Select Subject
                            </label>
                            <select
                                id="subject-select"
                                value={selectedSubjectId}
                                onChange={(e) => setSelectedSubjectId(e.target.value)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                            >
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="program-select" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Select Program
                            </label>
                            <select
                                id="program-select"
                                value={selectedProgramId}
                                onChange={(e) => setSelectedProgramId(e.target.value)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                            >
                                {programs.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.name} ({program.level.name} - {program.track.name})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="p-4 sm:p-6 mt-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700">
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 flex items-center">
                            Assignment Preview
                        </h3>
                        {selectedTeacher && selectedSubject && selectedProgram ? (
                            <div className="text-lg text-gray-700 dark:text-gray-200">
                                <p className="mb-2">
                                    <span className="font-semibold text-indigo-500">Teacher:</span> {selectedTeacher.name || selectedTeacher.email}
                                </p>
                                <p className="mb-2">
                                    <span className="font-semibold text-green-500">Subject:</span> {selectedSubject.name}
                                </p>
                                <p>
                                    <span className="font-semibold text-purple-500">Program:</span> {selectedProgram.name} ({selectedProgram.level.name} - {selectedProgram.track.name})
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">
                                Select a teacher, subject, and program to see the assignment preview.
                            </p>
                        )}
                    </div>

                    <div className="pt-6">
                        <Button
                            onClick={handleAssignment}
                            variant="primary"
                            size="lg"
                            withIcon={true}
                            disabled={isAssigning || !selectedTeacherId || !selectedSubjectId || !selectedProgramId}
                            className="w-full text-lg"
                        >
                            {isAssigning ? 
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Assigning...</> : 
                                <><CheckCircle className="w-5 h-5 mr-2" /> Confirm Assignment</>
                            }
                        </Button>
                    </div>
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                        <ListOrdered className="w-5 h-5 mr-3 text-yellow-500" />
                        Current Assignments ({currentAssignments.reduce((acc, a) => acc + a.assignments.length, 0)})
                    </h2>
                    
                    {currentAssignments.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center shadow-lg">
                            <p className="text-gray-600 dark:text-gray-400">No subjects are currently assigned to any teacher.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentAssignments.map((assignment) => (
                                <div 
                                    key={assignment.user.id} 
                                    className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border-l-4 border-indigo-500 dark:border-indigo-400"
                                >
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        Teacher: {assignment.user.name || assignment.user.email}
                                    </h3>
                                    <ul className="space-y-2">
                                        {assignment.assignments.map(assign => {
                                            const assignmentKey = `${assignment.user.id}-${assign.subject.id}`;
                                            const isDeleting = deletingAssignment === assignmentKey;
                                            return (
                                                <li key={`${assign.subject.id}-${assign.program.id}`} className="flex flex-col sm:flex-row justify-between sm:items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                    <div className="mb-2 sm:mb-0">
                                                        <span className="text-gray-700 dark:text-gray-200 font-medium">
                                                            {assign.subject.name}
                                                        </span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 block">
                                                            Program: {assign.program.name}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleDeleteAssignment(assignment.user.id, assign.subject.id)}
                                                        variant="destructive"
                                                        size="sm"
                                                        withIcon={true}
                                                        disabled={isDeleting}
                                                        className="w-full sm:w-auto justify-center"
                                                    >
                                                        {isDeleting ? 
                                                            <Loader2 className="w-4 h-4 animate-spin" /> : 
                                                            <Trash2 className="w-4 h-4" />
                                                        }
                                                        <span className="ml-1">Unassign</span>
                                                    </Button>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AdminAssignmentPage;