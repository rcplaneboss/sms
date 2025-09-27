
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/LinkAsButton"; 
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi'; 

// Define a separate Zod schema for the form
const pricingFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  amountMinor: z.coerce.number().int().positive({ message: "Amount must be a positive integer." }),
  currency: z.string().length(3, { message: "Currency must be a 3-letter code (e.g., NGN)." }),
  intervalMonths: z.coerce.number().int().positive({ message: "Interval must be a positive integer (months)." }),
  active: z.boolean().default(true),
});

type PricingFormValues = z.infer<typeof pricingFormSchema>;

interface PricingPlan {
  id: string;
  name: string;
  amountMinor: number;
  currency: string;
  intervalMonths: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const PricingPage = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PricingPlan | null>(null);

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      name: "",
      amountMinor: 0,
      currency: "NGN",
      intervalMonths: 1,
      active: true,
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin-pricing");
      if (!res.ok) throw new Error("Failed to fetch pricing plans");
      const data: PricingPlan[] = await res.json();
      setPlans(data);
    } catch (error) {
      toast.error("Failed to load pricing plans.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (plan: PricingPlan | null = null) => {
    setCurrentPlan(plan);
    if (plan) {
      form.reset({
        name: plan.name,
        amountMinor: plan.amountMinor,
        currency: plan.currency,
        intervalMonths: plan.intervalMonths,
        active: plan.active,
      });
    } else {
      form.reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPlan(null);
  };

  const onSubmit = async (data: PricingFormValues) => {
    const toastId = toast.loading("Saving pricing plan...");
    try {
      const isEditing = !!currentPlan;
      const url = isEditing
        ? `/api/admin/pricing/${currentPlan?.id}`
        : "/api/admin/pricing";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save plan");

      await fetchData();
      handleCloseModal();
      toast.success("Pricing plan saved successfully!", { id: toastId });
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Failed to save plan. Please try again.", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    const toastId = toast.loading("Deleting pricing plan...");
    try {
      const res = await fetch(`/api/admin/pricing/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete plan");
      await fetchData();
      toast.success("Pricing plan deleted successfully!", { id: toastId });
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete plan. Please try again.", { id: toastId });
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8 transition-colors duration-500">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">Pricing Plans</h1>
          <Button onClick={() => handleOpenModal()} variant="primary" size="sm" withIcon={true}>
            <FiPlus className="mr-2" /> Add New Plan
          </Button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Interval
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No pricing plans found.
                    </td>
                  </tr>
                ) : (
                  plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">{plan.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatAmount(plan.amountMinor, plan.currency)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {plan.intervalMonths === 1 ? "Monthly" : `${plan.intervalMonths} Months`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {plan.active ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(plan)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200 mr-2 p-1"
                          aria-label={`Edit ${plan.name}`}
                        >
                          <FiEdit className="inline-block h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 p-1"
                          aria-label={`Delete ${plan.name}`}
                        >
                          <FiTrash2 className="inline-block h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-70 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl transform transition-transform duration-300 scale-95 md:scale-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {currentPlan ? "Edit Pricing Plan" : "Add New Pricing Plan"}
            </h2>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Form fields with dark mode styling */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input 
                  id="name" 
                  {...form.register("name")} 
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
                {form.formState.errors.name && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="amountMinor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (in cents/kobo)</label>
                <input 
                  id="amountMinor" 
                  type="number" 
                  {...form.register("amountMinor", { valueAsNumber: true })} 
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
                {form.formState.errors.amountMinor && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{form.formState.errors.amountMinor.message}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                <input 
                  id="currency" 
                  {...form.register("currency")} 
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
                {form.formState.errors.currency && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{form.formState.errors.currency.message}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="intervalMonths" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interval (in months)</label>
                <input 
                  id="intervalMonths" 
                  type="number" 
                  {...form.register("intervalMonths", { valueAsNumber: true })} 
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
                {form.formState.errors.intervalMonths && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{form.formState.errors.intervalMonths.message}</p>}
              </div>
              <div className="flex items-center mb-4">
                <input 
                  id="active" 
                  type="checkbox" 
                  {...form.register("active")} 
                  className="h-4 w-4 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500" 
                />
                <label htmlFor="active" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" onClick={handleCloseModal} variant="secondary" size="sm" withIcon={false}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" withIcon={false} disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;