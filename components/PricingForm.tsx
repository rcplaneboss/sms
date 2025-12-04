"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Program {
  id: string;
  name: string;
  description?: string;
  level: { name: string };
  track: { name: string };
}

interface PricingFormProps {
  programs: Program[];
  initialPricing?: {
    id: string;
    programId: string;
    amount: number;
    currency: string;
    billingCycle: string;
    description?: string;
    discountPercent?: number;
    discountEndDate?: string;
    isActive: boolean;
  };
  isEditing?: boolean;
}

export function PricingForm({
  programs,
  initialPricing,
  isEditing = false,
}: PricingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    programId: initialPricing?.programId || "",
    amount: initialPricing?.amount?.toString() || "",
    currency: initialPricing?.currency || "NGN",
    billingCycle: initialPricing?.billingCycle || "ANNUAL",
    description: initialPricing?.description || "",
    discountPercent: initialPricing?.discountPercent?.toString() || "",
    discountEndDate: initialPricing?.discountEndDate?.split("T")[0] || "",
    isActive: initialPricing?.isActive ?? true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const method = isEditing ? "PUT" : "POST";
      const endpoint = isEditing
        ? `/api/pricing/${formData.programId}`
        : "/api/pricing";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          discountPercent: formData.discountPercent
            ? parseFloat(formData.discountPercent)
            : null,
          discountEndDate: formData.discountEndDate || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to save pricing");
        return;
      }

      toast.success(
        isEditing ? "Pricing updated successfully!" : "Pricing created successfully!"
      );
      router.push("/pricing-list");
      router.refresh();
    } catch (error) {
      console.error("Error saving pricing:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Program Selection */}
      <div>
        <Label htmlFor="programId">Program *</Label>
        <Select
          value={formData.programId}
          onValueChange={(value) => handleSelectChange("programId", value)}
          disabled={isEditing}
        >
          <SelectTrigger id="programId">
            <SelectValue placeholder="Select a program" />
          </SelectTrigger>
          <SelectContent>
            {programs.map((prog) => (
              <SelectItem key={prog.id} value={prog.id}>
                {prog.name} ({prog.level.name} - {prog.track.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Amount */}
      <div>
        <Label htmlFor="amount">Amount *</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          placeholder="Enter amount (e.g., 50000)"
          value={formData.amount}
          onChange={handleChange}
          required
        />
      </div>

      {/* Currency */}
      <div>
        <Label htmlFor="currency">Currency</Label>
        <Select
          value={formData.currency}
          onValueChange={(value) => handleSelectChange("currency", value)}
        >
          <SelectTrigger id="currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NGN">NGN (Nigerian Naira)</SelectItem>
            <SelectItem value="USD">USD (US Dollar)</SelectItem>
            <SelectItem value="GBP">GBP (British Pound)</SelectItem>
            <SelectItem value="EUR">EUR (Euro)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Billing Cycle */}
      <div>
        <Label htmlFor="billingCycle">Billing Cycle</Label>
        <Select
          value={formData.billingCycle}
          onValueChange={(value) => handleSelectChange("billingCycle", value)}
        >
          <SelectTrigger id="billingCycle">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ONE_TIME">One Time</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="SEMESTER">Per Semester</SelectItem>
            <SelectItem value="ANNUAL">Annual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          placeholder="E.g., Includes all materials and resources"
          value={formData.description}
          onChange={handleChange}
          className="h-24 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500"
        />
      </div>

      {/* Discount */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discountPercent">Discount %</Label>
          <Input
            id="discountPercent"
            name="discountPercent"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="E.g., 10"
            value={formData.discountPercent}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="discountEndDate">Discount End Date</Label>
          <Input
            id="discountEndDate"
            name="discountEndDate"
            type="date"
            value={formData.discountEndDate}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-2">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 dark:bg-slate-950 dark:checked:bg-slate-700"
        />
        <Label htmlFor="isActive" className="mb-0 cursor-pointer dark:text-slate-300">
          Active
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || !formData.programId || !formData.amount}
        className="w-full"
      >
        {isLoading
          ? "Saving..."
          : isEditing
            ? "Update Pricing"
            : "Create Pricing"}
      </Button>
    </form>
  );
}
