"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtext?: string;
  trend?: {
    direction: "up" | "down";
    value: string;
  };
  className?: string;
}

export function DashboardStatCard({
  title,
  value,
  icon,
  subtext,
  trend,
  className = "",
}: DashboardStatCardProps) {
  return (
    <Card className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </CardTitle>
          <div className="text-slate-400 dark:text-slate-600">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {subtext}
            </p>
          )}
          {trend && (
            <p className={`text-xs font-medium ${trend.direction === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {trend.direction === "up" ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
