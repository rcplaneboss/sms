"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vacancySchema, VacancyFormValues } from "@/prisma/schema";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/LinkAsButton";

interface Vacancy {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
}

const VacanciesPage = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [vacancyToDelete, setVacancyToDelete] = useState<string | null>(null);
  const [currentVacancy, setCurrentVacancy] = useState<Vacancy | null>(null);

  const form = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      location: "",
      type: "FULL_TIME",
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vacancies");
      if (!res.ok) throw new Error("Failed to fetch vacancies");
      const data: Vacancy[] = await res.json();
      setVacancies(data);
    } catch (error) {
      console.error("Error fetching vacancies:", error);
      toast.error("Failed to load vacancies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (vacancy: Vacancy | null = null) => {
    setCurrentVacancy(vacancy);
    if (vacancy) {
      form.reset({
        title: vacancy.title,
        description: vacancy.description,
        requirements: vacancy.requirements.join(", "),
        location: vacancy.location,
        type: vacancy.type,
      });
    } else {
      form.reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVacancy(null);
  };

  const onSubmit = async (data: VacancyFormValues) => {
    const toastId = toast.loading("Saving vacancy...");
    try {
      const isEditing = !!currentVacancy;
      const url = isEditing
        ? `/api/vacancies/${currentVacancy?.id}`
        : "/api/vacancies";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...data,
        requirements: data.requirements
          ?.split(",")
          .map((req) => req.trim())
          .filter((req) => req.length > 0),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save vacancy");

      await fetchData();
      handleCloseModal();
      toast.success("Vacancy saved successfully!", { id: toastId });
    } catch (error) {
      console.error("Error saving vacancy:", error);
      toast.error("Failed to save vacancy. Please try again.", { id: toastId });
    }
  };

  const handleDeleteClick = (id: string) => {
    setVacancyToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!vacancyToDelete) return;
    const toastId = toast.loading("Deleting vacancy...");
    try {
      const res = await fetch(`/api/vacancies/${vacancyToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete vacancy");

      await fetchData();
      toast.success("Vacancy deleted successfully!", { id: toastId });
    } catch (error) {
      console.error("Error deleting vacancy:", error);
      toast.error("Failed to delete vacancy. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsConfirmModalOpen(false);
      setVacancyToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setVacancyToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 dark:bg-gray-800">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Vacancies</h1>
          <Button
            onClick={() => handleOpenModal()}
            variant={"primary"}
            size={"sm"}
          >
            Add Vacancy
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {vacancies.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No vacancies found.
                  </td>
                </tr>
              ) : (
                vacancies.map((vacancy) => (
                  <tr key={vacancy.id}>
                    <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                      {vacancy.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                      {vacancy.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                      {vacancy.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenModal(vacancy)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(vacancy.id)}
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
          <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center dark:bg-opacity-80">
            <div className="bg-white p-6 rounded-lg w-full max-w-md dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-4">
                {currentVacancy ? "Edit Vacancy" : "Add Vacancy"}
              </h2>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium">
                    Job Title
                  </label>
                  <input
                    id="title"
                    {...form.register("title")}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium">
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
                  <label htmlFor="requirements" className="block text-sm font-medium">
                    Requirements (comma-separated)
                  </label>
                  <input
                    id="requirements"
                    {...form.register("requirements")}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                    placeholder="e.g., Degree, 2+ years experience, Strong communication"
                  />
                  {form.formState.errors.requirements && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.requirements.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="location" className="block text-sm font-medium">
                    Location
                  </label>
                  <input
                    id="location"
                    {...form.register("location")}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                  {form.formState.errors.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.location.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="type" className="block text-sm font-medium">
                    Job Type
                  </label>
                  <select
                    id="type"
                    {...form.register("type")}
                    className="w-full border rounded-md px-3 py-2 mt-1 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                  {form.formState.errors.type && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.type.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    className=""
                    variant={"secondary"}
                    size={"sm"}
                    withIcon={false}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className=""
                    variant={"primary"}
                    size={"sm"}
                    withIcon={false}
                  >
                    {form.formState.isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center">
              <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
              <p className="mb-4">Are you sure you want to delete this vacancy?</p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleCancelDelete}
                  variant={"secondary"}
                  size={"sm"}
                  withIcon={false}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  variant={"danger"}
                  size={"sm"}
                  withIcon={false}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VacanciesPage;
