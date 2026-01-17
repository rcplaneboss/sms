"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { CheckSquare, BookOpen, Clock, AlertTriangle } from "lucide-react";

const courseSchema = {
  id: "",
  name: "",
  subject: { name: "" },
  programs: [{ name: "", level: { name: "" } }],
};

const TeacherAssignmentPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch("/api/assign/teacher");
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch assignments");
        }
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
        toast.error("Could not load your assignments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const CourseCard = ({ course }) => {
    // Assuming the first program linked is the primary one for display
    const primaryProgram = course.programs[0];

    return (
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
            {course.name}
          </h3>
          <CheckSquare className="w-6 h-6 text-green-500 dark:text-green-400" />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Scheduled for the current academic session.
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <BookOpen className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="font-medium">Subject:</span> {course.subject.name}
          </div>
          {primaryProgram && (
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <Clock className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
              <span className="font-medium">Level/Program:</span>{" "}
              {primaryProgram.level.name} - {primaryProgram.name}
            </div>
          )}
          <div className="pt-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
              Active
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center p-10">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your assignments...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-10 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4" />
          <p>Error: {error}</p>
        </div>
      );
    }

    if (courses.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No Assignments Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            It looks like the administrator hasn't assigned any classes to you
            yet. Please check back later.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8 transition-colors duration-300">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <header className="py-6 mb-8 border-b dark:border-gray-800">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
            My Teaching Assignments
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            View the subjects and programs you have been assigned to teach this
            session.
          </p>
        </header>

        {renderContent()}
      </div>
    </div>
  );
};

export default TeacherAssignmentPage;
