// "use client";

// import TeacherRegister from "@/components/TeacherTabsClient";
// import { useSearchParams } from "next/navigation";

// export default function TeacherRegisterPage() {
//   const searchParams = useSearchParams();
//   const vacancyId = searchParams.get("vacancyId"); 

//   if (!vacancyId) {
//     return (
//       <main className="min-h-screen flex items-center justify-center">
//         <p className="text-red-500 font-semibold">
//           ❌ No vacancy selected. Please apply through a vacancy link.
//         </p>
//       </main>
//     );
//   }

//   return (
//     <main className="min-h-screen flex items-center justify-center">
//       <TeacherRegister vacancyId={vacancyId} />
//     </main>
//   );
// }

"use client"
import { Suspense } from "react";
import TeacherRegister from "@/components/TeacherTabsClient";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function TeacherRegisterPageClient() {
  "use client";

  const searchParams = useSearchParams();
  const vacancyId = searchParams.get("vacancyId");

  if (!vacancyId) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-semibold">
          ❌ No vacancy selected. Please apply through a vacancy link.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <TeacherRegister vacancyId={vacancyId} />
    </main>
  );
}

export default function TeacherRegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </main>
      }
    >
      <TeacherRegisterPageClient />
    </Suspense>
  );
}
