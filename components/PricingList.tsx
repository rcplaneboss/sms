"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Pricing {
  id: string;
  programId: string;
  program: {
    id: string;
    name: string;
    level: { name: string };
    track: { name: string };
  };
  amount: number;
  currency: string;
  billingCycle: string;
  description?: string;
  discountPercent?: number;
  discountEndDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PricingListProps {
  pricing: Pricing[];
}

export function PricingList({ pricing }: PricingListProps) {
  const [pricingList, setPricingList] = useState(pricing);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (programId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/pricing/${programId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Failed to delete pricing");
        return;
      }

      setPricingList(pricingList.filter((p) => p.programId !== programId));
      toast.success("Pricing deleted successfully!");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting pricing:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateDiscountedPrice = (
    amount: number,
    discountPercent?: number
  ) => {
    if (!discountPercent) return null;
    return amount * (1 - discountPercent / 100);
  };

  if (pricingList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 py-12">
        <p className="text-gray-500 dark:text-slate-400">No pricing created yet.</p>
        <Link href="/set-pricing">
          <Button className="mt-4">Create First Pricing</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
              Program
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
              Level
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
              Billing Cycle
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
              Discount
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {pricingList.map((item) => (
            <tr key={item.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-900/30">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-100">
                {item.program.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                {item.program.level.name}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-slate-100">
                <div>
                  {formatPrice(item.amount, item.currency)}
                </div>
                {item.discountPercent && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    -{item.discountPercent}% ={" "}
                    {formatPrice(
                      calculateDiscountedPrice(
                        item.amount,
                        item.discountPercent
                      ) || item.amount,
                      item.currency
                    )}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                {item.billingCycle}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                {item.discountPercent ? (
                  <div>
                    <div className="font-medium text-green-600 dark:text-green-400">
                      {item.discountPercent}% off
                    </div>
                    {item.discountEndDate && (
                      <div className="text-xs text-gray-500 dark:text-slate-500">
                        Until {new Date(item.discountEndDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-slate-600">No discount</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    item.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <Link href={`/set-pricing/${item.programId}`}>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(item.programId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="rounded-lg bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 p-6 shadow-lg max-w-sm mx-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Delete Pricing?</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
              Are you sure you want to delete this pricing? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                disabled={isDeleting}
                onClick={() => deleteId && handleDelete(deleteId)}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
