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
          <h1 className="text-3xl font-bold">Academic Tracks</h1>
          <Button
            onClick={() => handleOpenModal()}
            variant="primary"
            size="sm"
          >
            Add Track
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tracks.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No tracks found.
                  </td>
                </tr>
              ) : (
                tracks.map((track) => (
                  <tr key={track.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {track.name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenModal(track)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(track.id)}
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
                {currentTrack ? "Edit Track" : "Add Track"}
              </h2>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Track Name
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

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    variant="secondary"
                    size="sm"
                    icon={false}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    variant="primary"
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
