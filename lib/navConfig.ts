// lib/navConfig.ts
export const publicNav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/vacancy", label: "Vacancies" },
  { href: "/register", label: "Register" },
  { href: "/vacancy", label: "Teacher Application" },
  { href: "/login", label: "Login" },
];

export const studentNav = [
  { href: "/student-dashboard", label: "Dashboard" },
  { href: "/programs", label: "Programs" },
  { href: "/my-exams", label: "Exams" },
  { href: "/my-results", label: "Results" },
  { href: "/payments", label: "Payments" },
  { href: "/my-profile", label: "Profile" },
];

export const teacherNav = [
  { href: "/teacher-dashboard", label: "Dashboard" },
  { href: "/assigned-courses", label: "My Assignments" },
  { href: "/grading/grades", label: "Grading" },
  { href: "/grading/calculate", label: "Calculate Grades" },
  { href: "/teacher-exams", label: "Exams" },
  { href: "/settings", label: "Settings" },
];

export const adminNav = [
  { href: "/admin-dashboard", label: "Dashboard" },
  { href: "/approvals", label: "Approvals" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/assignments", label: "Assignments" },
  { href: "/exams", label: "Exams" },
   { href: "/grade-overview", label: "Grade Overview" },
      { href: "/levels", label: "Levels" },
      { href: "/tracks", label: "Tracks" },
      { href: "/subjects", label: "Subjects" },
      { href: "/terms", label: "School Terms Management" },
  { href: "/reports", label: "Reports" },
   { href: "/user-management", label: "User Management" },
      { href: "/pricing-list", label: "Pricing" },
      { href: "/adverts", label: "Adverts" },
  { href: "/settings", label: "Settings" },
];

export const adminNavGroups = [
  {
    label: "Main",
    items: [
      { href: "/admin-dashboard", label: "Dashboard" },
      { href: "/approvals", label: "Approvals" },
      { href: "/admin/payments", label: "Payments" },
    ]
  },
  {
    label: "Academic",
    items: [
      { href: "/assignments", label: "Assignments" },
      { href: "/exams", label: "Exams" },
      { href: "/grade-overview", label: "Grade Overview" },
      { href: "/admin-program", label: "Programs" },
      { href: "/levels", label: "Levels" },
      { href: "/tracks", label: "Tracks" },
      { href: "/subjects", label: "Subjects" },
      { href: "/terms", label: "School Terms Management" },
    ]
  },
  {
    label: "Management",
    items: [
      { href: "/user-management", label: "User Management" },
      { href: "/pricing-list", label: "Pricing" },
      { href: "/adverts", label: "Adverts" },
      { href: "/reports", label: "Reports" },
      { href: "/settings", label: "Settings" },
    ]
  }
];
