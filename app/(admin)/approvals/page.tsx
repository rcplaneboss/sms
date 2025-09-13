"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/LinkAsButton";

interface Application {
  id: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  vacancy: {
    title: string;
  } | null;
}

const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentApplicationId, setCurrentApplicationId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [message, setMessage] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data: Application[] = await res.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async () => {
    if (!currentApplicationId || !currentStatus) return;

    const toastId = toast.loading("Updating application...");
    try {
      const res = await fetch(`/api/applications/${currentApplicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: currentStatus, message }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      await fetchData();
      toast.success("Application status updated!", { id: toastId });
      handleCloseModal();
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update status. Please try again.", { id: toastId });
    }
  };

  const handleOpenModal = (appId: string, status: "APPROVED" | "REJECTED") => {
    setCurrentApplicationId(appId);
    setCurrentStatus(status);
    setMessage(status === "APPROVED" ? "Congratulations! Your application has been approved. Please log in to view the terms and conditions." : "Thank you for your application. We have decided not to proceed at this time.");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentApplicationId(null);
    setCurrentStatus(null);
    setMessage("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <p className="text-gray-600 dark:text-gray-400 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800 dark:text-gray-100 transition-colors duration-300">
          Manage Teacher Applications
        </h1>
        {applications.length === 0 ? (
          <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-md transition-colors duration-300">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No pending teacher applications found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-lg dark:hover:shadow-xl"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {app.user.name || "N/A"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-semibold">Email:</span> {app.user.email}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    <span className="font-semibold">Applying For:</span> {app.vacancy?.title || "N/A"}
                  </p>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    onClick={() => handleOpenModal(app.id, "REJECTED")}
                    variant={"destructive"}
                    size={"sm"}
                    withIcon={false}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleOpenModal(app.id, "APPROVED")}
                    variant={"primary"}
                    size={"sm"}
                    withIcon={false}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-70 dark:bg-gray-950 dark:bg-opacity-80 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg transform transition-all duration-300 scale-100">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
                {currentStatus === "APPROVED" ? "Approve Application" : "Reject Application"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                Edit the email message to be sent to the applicant.
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-40 p-4 border dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter your message here..."
              />
              <div className="flex justify-center space-x-4 mt-6">
                <Button
                  onClick={handleCloseModal}
                  variant={"secondary"}
                  size={"lg"}
                  withIcon={false}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStatusChange}
                  variant={currentStatus === "APPROVED" ? "primary" : "destructive"}
                  size={"lg"}
                  withIcon={false}
                >
                  {currentStatus === "APPROVED" ? "Send Approval" : "Send Rejection"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApplicationsPage;
