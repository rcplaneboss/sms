"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { levelSchema, LevelFormValues } from "@/prisma/schema"; 
import * as z from "zod";
import { Toaster, toast } from "sonner";



// Mock type definition
interface Level {
  id: string;
  name: string;
  description?: string;
}

const LevelsPage = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);

  const form = useForm<LevelFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/levels");
      if (!res.ok) throw new Error("Failed to fetch levels");
      const data: Level[] = await res.json();
      setLevels(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load levels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (level: Level | null = null) => {
    setCurrentLevel(level);
    if (level) {
      form.reset({
        name: level.name,
        description: level.description,
      });
    } else {
      form.reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentLevel(null);
  };

  const onSubmit = async (data: LevelFormValues) => {
    const toastId = toast.loading("Saving level...");
    try {
      const isEditing = !!currentLevel;
      const url = isEditing
        ? `/api/levels/${currentLevel?.id}`
        : "/api/levels";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save level");

      await fetchData();
      handleCloseModal();
      toast.success("Level saved successfully!", { id: toastId });
    } catch (error) {
      console.error("Error saving level:", error);
      toast.error("Failed to save level. Please try again.", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this level?"
    );
    if (!confirmed) return;

    const toastId = toast.loading("Deleting level...");
    try {
      const res = await fetch(`/api/levels/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete level");

      await fetchData();
      toast.success("Level deleted successfully!", { id: toastId });
    } catch (error) {
      console.error("Error deleting level:", error);
      toast.error("Failed to delete level. Please try again.", { id: toastId });
    }
  };

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
          <h1 className="text-3xl font-bold">Academic Levels</h1>
          {/* Replace with shadcn <Button> */}
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Add Level
          </button>
        </div>

        {/* This section would be a reusable <DataTable> component */}
        {/* Replace with shadcn <Table>, <TableHeader>, etc. */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {levels.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No levels found.
                  </td>
                </tr>
              ) : (
                levels.map((level) => (
                  <tr key={level.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {level.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {level.description || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {/* Replace with shadcn <Button variant="ghost"> */}
                      <button
                        onClick={() => handleOpenModal(level)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(level.id)}
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

        {/* Modal UI */}
        {isModalOpen && (
          // Replace with shadcn <Dialog>
          <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {currentLevel ? "Edit Level" : "Add Level"}
              </h2>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Level Name
                  </label>
                  {/* Replace with shadcn <Input> */}
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
                  {/* Replace with shadcn <Textarea> */}
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
                <div className="flex justify-end gap-2">
                  {/* Replace with shadcn <Button variant="outline"> */}
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

export default LevelsPage;
