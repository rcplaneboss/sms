import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="p-6 md:p-24 space-y-6 font-sans">
      <h1 className="text-3xl font-bold text-p1-hex">Admin Dashboard</h1>
      <p className="text-gray-700 dark:text-gray-300">
        Welcome back! Here’s an overview of the school management system.
      </p>

      {/* Grid for quick stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-medium text-t-dark-hex">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-s1-hex font-mono">1,245</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-medium text-t-dark-hex">
              Total Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-s1-hex font-mono">72</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-700 dark:bg-gray-800 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-medium text-t-dark-hex">
              Open Vacancies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-s1-hex font-mono">5</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border border-gray-500 dark:bg-gray-800 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-medium text-t-dark-hex">
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base font-medium font-sans dark:text-white text-black">
              List of student/teacher applications will go here.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-500 dark:bg-gray-800 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-medium font-sans dark:text-white text-black">
              System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800 dark:text-gray-300">
              Audit logs and recent actions will show here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
