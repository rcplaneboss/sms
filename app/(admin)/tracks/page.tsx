"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trackSchema, TrackFormValues } from "@/prisma/schema";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/LinkAsButton";

// Mock type definition
interface Track {
  id: string;
  name: string;
}

const TracksPage = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      name: "",
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tracks");
      if (!res.ok) throw new Error("Failed to fetch tracks");
      const data: Track[] = await res.json();
      setTracks(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load tracks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (track: Track | null = null) => {
    setCurrentTrack(track);
    if (track) {
      form.reset({
        name: track.name,
      });
    } else {
      form.reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTrack(null);
  };

  const onSubmit = async (data: TrackFormValues) => {
    const toastId = toast.loading("Saving track...");
    try {
      const isEditing = !!currentTrack;
      const url = isEditing ? `/api/tracks/${currentTrack?.id}` : "/api/tracks";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save track");

      await fetchData();
      handleCloseModal();
      toast.success("Track saved successfully!", { id: toastId });
    } catch (error) {
      console.error("Error saving track:", error);
      toast.error("Failed to save track. Please try again.", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this track?"
    );
    if (!confirmed) return;

    const toastId = toast.loading("Deleting track...");
    try {
      const res = await fetch(`/api/tracks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete track");

      await fetchData();
      toast.success("Track deleted successfully!", { id: toastId });
    } catch (error) {
      console.error("Error deleting track:", error);
      toast.error("Failed to delete track. Please try again.", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="dark:text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">Academic Tracks</h1>
          <Button
            onClick={() => handleOpenModal()}
            variant="primary"
            size="sm"
          >
            Add Track
          </Button>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {tracks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No tracks found.</p>
            </div>
          ) : (
            tracks.map((track) => (
              <div key={track.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="font-semibold text-lg dark:text-white mb-3">{track.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(track)}
                    className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(track.id)}
                    className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tracks.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No tracks found.
                  </td>
                </tr>
              ) : (
                tracks.map((track) => (
                  <tr key={track.id}>
                    <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                      {track.name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenModal(track)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(track.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
          <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 dark:bg-opacity-80 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">
                {currentTrack ? "Edit Track" : "Add Track"}
              </h2>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium dark:text-gray-200">
                    Track Name
                  </label>
                  <input
                    id="name"
                    {...form.register("name")}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 mt-1 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    variant="secondary"
                    size="sm"
                    icon={false}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    variant="primary"
                    className="w-full sm:w-auto"
                  >
                    {form.formState.isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TracksPage;
