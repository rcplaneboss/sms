"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema, CourseFormValues } from "@/prisma/schema";
import { Toaster, toast } from "sonner";


interface Course {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  subject?: { name: string };
}

interface Subject {
  id: string;
  name: string;
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: { name: "", description: "", subjectId: "" },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, subjectsRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/subjects"),
      ]);

      if (!coursesRes.ok || !subjectsRes.ok)
        throw new Error("Failed to fetch data");

      const coursesData: Course[] = await coursesRes.json();
      const subjectsData: Subject[] = await subjectsRes.json();

      setCourses(coursesData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (course: Course | null = null) => {
    setCurrentCourse(course);
    if (course) {
      form.reset({
        name: course.name,
        description: course.description,
        subjectId: course.subjectId,
      });
    } else {
      form.reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCourse(null);
  };

  const onSubmit = async (data: CourseFormValues) => {
    const toastId = toast.loading("Saving course...");
    try {
      const isEditing = !!currentCourse;
      const url = isEditing
        ? `/api/courses/${currentCourse?.id}`
        : "/api/courses";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save course");

      await fetchData();
      handleCloseModal();
      toast.success("Course saved successfully!", { id: toastId });
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error("Failed to save course. Please try again.", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?"
    );
    if (!confirmed) return;

    const toastId = toast.loading("Deleting course...");
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete course");

      await fetchData();
      toast.success("Course deleted successfully!", { id: toastId });
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course. Please try again.", {
        id: toastId,
      });
    }
  };

  const getSubjectName = (subjectId: string) =>
    subjects.find((s) => s.id === subjectId)?.name || "N/A";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Courses</h1>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Add Course
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No courses found.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {course.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSubjectName(course.subjectId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenModal(course)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {currentCourse ? "Edit Course" : "Add Course"}
              </h2>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Course Name
                  </label>
                  <input
                    id="name"
                    {...form.register("name")}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    {...form.register("description")}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                  {form.formState.errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="subjectId"
                    className="block text-sm font-medium"
                  >
                    Subject
                  </label>
                  <select
                    id="subjectId"
                    {...form.register("subjectId")}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  >
                    <option value="">Select a Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.subjectId && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.subjectId.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  >
                    {form.formState.isSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
