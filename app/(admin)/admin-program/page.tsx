"use client";

import React, { useState, useEffect } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { programSchema, ProgramFormValues } from "@/prisma/schema";

import { Toaster, toast } from "sonner";

import { Button } from "@/components/ui/LinkAsButton";

interface Level {
  id: string;

  name: string;
}

interface Track {
  id: string;

  name: string;
}

interface Subject {
  id: string;

  name: string;
}

interface Course {
  id: string;

  name: string;
}

interface Program {
  id: string;

  name: string;

  description?: string;

  levelId: string;

  trackId: string;

  courses: Course[];

  subjects: Subject[];
}

const ProgramsPage = () => {
  const [programs, setPrograms] = useState<Program[]>([]);

  const [levels, setLevels] = useState<Level[]>([]);

  const [tracks, setTracks] = useState<Track[]>([]);

  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [courses, setCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const [programToDelete, setProgramToDelete] = useState<string | null>(null);

  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),

    defaultValues: {
      name: "",

      description: "",

      levelId: "",

      trackId: "",

      courseIds: [],

      subjectIds: [],
    },
  });

  const fetchData = async () => {
    setLoading(true);

    try {
      const [programsRes, levelsRes, tracksRes, coursesRes, subjectsRes] =
        await Promise.all([
          fetch("/api/programs"),

          fetch("/api/levels"),

          fetch("/api/tracks"),

          fetch("/api/courses"),

          fetch("/api/subjects"),
        ]);

      if (
        !programsRes.ok ||
        !levelsRes.ok ||
        !tracksRes.ok ||
        !coursesRes.ok ||
        !subjectsRes.ok
      ) {
        throw new Error("Failed to fetch data");
      }

      const programsData: Program[] = await programsRes.json();

      const levelsData: Level[] = await levelsRes.json();

      const tracksData: Track[] = await tracksRes.json();

      const coursesData: Course[] = await coursesRes.json();

      const subjectsData: Subject[] = await subjectsRes.json();

      setPrograms(programsData);

      setLevels(levelsData);

      setTracks(tracksData);

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

  const handleOpenModal = (program: Program | null = null) => {
    setCurrentProgram(program);

    if (program) {
      form.reset({
        name: program.name,

        description: program.description,

        levelId: program.levelId,

        trackId: program.trackId,

        courseIds: program.courses.map((course) => course.id),

        subjectIds: program.subjects.map((subject) => subject.id),
      });
    } else {
      form.reset();
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);

    setCurrentProgram(null);
  };

  const onSubmit = async (data: ProgramFormValues) => {
    const toastId = toast.loading("Saving program...");

    try {
      const isEditing = !!currentProgram;

      const url = isEditing
        ? `/api/programs/${currentProgram?.id}`
        : "/api/programs";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save program");

      await fetchData();

      handleCloseModal();

      toast.success("Program saved successfully!", { id: toastId });
    } catch (error) {
      console.error("Error saving program:", error);

      toast.error("Failed to save program. Please try again.", { id: toastId });
    }
  };

  const handleDeleteClick = (id: string) => {
    setProgramToDelete(id);

    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!programToDelete) return;

    const toastId = toast.loading("Deleting program...");

    try {
      const res = await fetch(`/api/programs/${programToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete program");

      await fetchData();

      toast.success("Program deleted successfully!", { id: toastId });
    } catch (error) {
      console.error("Error deleting program:", error);

      toast.error("Failed to delete program. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsConfirmModalOpen(false);

      setProgramToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);

    setProgramToDelete(null);
  };

  const getLevelName = (levelId: string) =>
    levels.find((l) => l.id === levelId)?.name || "N/A";

  const getTrackName = (trackId: string) =>
    tracks.find((t) => t.id === trackId)?.name || "N/A";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p>Loading...</p>     {" "}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 relative">
            <Toaster />     {" "}
      <div className="max-w-6xl mx-auto">
               {" "}
        <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Programs</h1>         {" "}
          <Button
            onClick={() => handleOpenModal()}
            variant={"primary"}
            size={"sm"}
          >
                        Add Program          {" "}
          </Button>
                 {" "}
        </div>
               {" "}
        <div className="bg-white rounded-lg shadow overflow-hidden">
                   {" "}
          <table className="min-w-full divide-y divide-gray-200 overflow-x-scroll">
                       {" "}
            <thead className="bg-gray-50">
                           {" "}
              <tr>
                               {" "}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name                {" "}
                </th>
                               {" "}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Level                {" "}
                </th>
                               {" "}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Track                {" "}
                </th>
                               {" "}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Courses                {" "}
                </th>
                               {" "}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subjects                {" "}
                </th>
                               {" "}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions                {" "}
                </th>
                             {" "}
              </tr>
                         {" "}
            </thead>
                       {" "}
            <tbody className="bg-white divide-y divide-gray-200">
                           {" "}
              {programs?.length === 0 ? (
                <tr>
                                   {" "}
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                                        No programs found.                  {" "}
                  </td>
                                 {" "}
                </tr>
              ) : (
                programs.map((program) => (
                  <tr key={program.id}>
                                       {" "}
                    <td className="px-6 py-4 whitespace-nowrap">
                                            {program.name}                   {" "}
                    </td>
                                       {" "}
                    <td className="px-6 py-4 whitespace-nowrap">
                                            {getLevelName(program.levelId)}     
                                   {" "}
                    </td>
                                       {" "}
                    <td className="px-6 py-4 whitespace-nowrap">
                                            {getTrackName(program.trackId)}     
                                   {" "}
                    </td>
                                       {" "}
                    <td className="px-6 py-4 whitespace-nowrap">
                                            {program.courses?.length}           
                             {" "}
                    </td>
                                       {" "}
                    <td className="px-6 py-4 whitespace-nowrap">
                                            {program.subjects?.length}         
                               {" "}
                    </td>
                                       {" "}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                           {" "}
                      <button
                        onClick={() => handleOpenModal(program)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >Edit{" "}
                      </button>{" "}
                      <button
                        onClick={() => handleDeleteClick(program.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                                                Delete                      {" "}
                      </button>
                                         {" "}
                    </td>
                                     {" "}
                  </tr>
                ))
              )}
                         {" "}
            </tbody>
                     {" "}
          </table>
                 {" "}
        </div>
               {" "}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center overflow-y-scroll ">
                       {" "}
            <div className="bg-white p-6 rounded-lg w-full max-w-md  mt-64">
                           {" "}
              <h2 className="text-xl font-semibold mb-4">
                               {" "}
                {currentProgram ? "Edit Program" : "Add Program"}             {" "}
              </h2>
                           {" "}
              <form onSubmit={form.handleSubmit(onSubmit)}>
                               {" "}
                <div className="mb-4">
                                   {" "}
                  <label htmlFor="name" className="block text-sm font-medium">
                                        Program Name                  {" "}
                  </label>
                                   {" "}
                  <input
                    id="name"
                    {...form.register("name")}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                                   {" "}
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                                            {form.formState.errors.name.message}
                                         {" "}
                    </p>
                  )}
                                 {" "}
                </div>
                               {" "}
                <div className="mb-4">
                                   {" "}
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium"
                  >
                                        Program Duration                  {" "}
                  </label>
                                   {" "}
                  <input
                    id="duration"
                    {...form.register("duration")}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                                   {" "}
                  {form.formState.errors.duration && (
                    <p className="text-red-500 text-sm mt-1">
                                           {" "}
                      {form.formState.errors.duration.message}                 
                       {" "}
                    </p>
                  )}
                                 {" "}
                </div>
                               {" "}
                <div className="mb-4">
                                   {" "}
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium"
                  >
                                        Description                  {" "}
                  </label>
                                   {" "}
                  <textarea
                    id="description"
                    {...form.register("description")}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                                   {" "}
                  {form.formState.errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                                           {" "}
                      {form.formState.errors.description.message}               
                         {" "}
                    </p>
                  )}
                                 {" "}
                </div>
                               {" "}
                <div className="mb-4">
                                   {" "}
                  <label
                    htmlFor="levelId"
                    className="block text-sm font-medium"
                  >
                                        Level                  {" "}
                  </label>
                                   {" "}
                  <select
                    id="levelId"
                    {...form.register("levelId")}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  >
                                        <option value="">Select a Level</option>
                                       {" "}
                    {levels.map((level) => (
                      <option key={level.id} value={level.id}>
                                                {level.name}                   
                         {" "}
                      </option>
                    ))}
                                     {" "}
                  </select>
                                   {" "}
                  {form.formState.errors.levelId && (
                    <p className="text-red-500 text-sm mt-1">
                                           {" "}
                      {form.formState.errors.levelId.message}                   {" "}
                    </p>
                  )}
                                 {" "}
                </div>
                               {" "}
                <div className="mb-4">
                                   {" "}
                  <label
                    htmlFor="trackId"
                    className="block text-sm font-medium"
                  >
                                        Track                  {" "}
                  </label>
                                   {" "}
                  <select
                    id="trackId"
                    {...form.register("trackId")}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  >
                                        <option value="">Select a Track</option>
                                       {" "}
                    {tracks.map((track) => (
                      <option key={track.id} value={track.id}>
                                                {track.name}                   
                         {" "}
                      </option>
                    ))}
                                     {" "}
                  </select>
                                   {" "}
                  {form.formState.errors.trackId && (
                    <p className="text-red-500 text-sm mt-1">
                                           {" "}
                      {form.formState.errors.trackId.message}                   {" "}
                    </p>
                  )}
                                 {" "}
                </div>
                               {" "}
                <div className="mb-4">
                                   {" "}
                  <label
                    htmlFor="subjectIds"
                    className="block text-sm font-medium"
                  >
                                        Subjects                  {" "}
                  </label>
                                   {" "}
                  <select
                    id="subjectIds"
                    multiple
                    {...form.register("subjectIds")}
                    className="w-full border rounded-md px-3 py-2 mt-1 h-32"
                  >
                                       {" "}
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                                                {subject.name}                 
                           {" "}
                      </option>
                    ))}
                                     {" "}
                  </select>
                                   {" "}
                  {form.formState.errors.subjectIds && (
                    <p className="text-red-500 text-sm mt-1">
                                           {" "}
                      {form.formState.errors.subjectIds.message}               
                         {" "}
                    </p>
                  )}
                                 {" "}
                </div>
                               {" "}
                <div className="mb-4">
                                   {" "}
                  <label
                    htmlFor="courseIds"
                    className="block text-sm font-medium"
                  >
                                        Courses                  {" "}
                  </label>
                                   {" "}
                  <select
                    id="courseIds"
                    multiple
                    {...form.register("courseIds")}
                    className="w-full border rounded-md px-3 py-2 mt-1 h-32"
                  >
                                       {" "}
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                                                {course.name}                   
                         {" "}
                      </option>
                    ))}
                                     {" "}
                  </select>
                                   {" "}
                  {form.formState.errors.courseIds && (
                    <p className="text-red-500 text-sm mt-1">
                                           {" "}
                      {form.formState.errors.courseIds.message}                 
                       {" "}
                    </p>
                  )}
                                 {" "}
                </div>
                               {" "}
                <div className="flex justify-end gap-2">
                                   {" "}
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border rounded-md"
                    variant={"secondary"}
                    size={"sm"}
                    withIcon={false}
                  >
                                        Cancel                  {" "}
                  </Button>
                                   {" "}
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    variant={"primary"}
                    size={"sm"}
                    withIcon={false}
                  >
                                       {" "}
                    {form.formState.isSubmitting ? "Saving..." : "Save"}       
                             {" "}
                  </Button>
                                 {" "}
                </div>
                             {" "}
              </form>
                         {" "}
            </div>
                     {" "}
          </div>
        )}
               {" "}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center">
                       {" "}
            <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center">
                           {" "}
              <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2> 
                         {" "}
              <p className="mb-4">
                                Are you sure you want to delete this program?  
                           {" "}
              </p>
                           {" "}
              <div className="flex justify-center gap-4">
                               {" "}
                <Button
                  onClick={handleCancelDelete}
                  variant={"danger"}
                  size={"sm"}
                  withIcon={false}
                >
                                    Cancel                {" "}
                </Button>
                               {" "}
                <Button
                  onClick={handleConfirmDelete}
                  variant={"danger"}
                  size={"sm"}
                  withIcon={false}
                >
                                    Delete                {" "}
                </Button>
                             {" "}
              </div>
                         {" "}
            </div>
                     {" "}
          </div>
        )}
             {" "}
      </div>
         {" "}
    </div>
  );
};
