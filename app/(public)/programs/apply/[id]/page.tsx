// app/programs/apply/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function ApplyProgramPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    // TODO: Call API to submit application
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="container mx-auto py-10 max-w-xl">
      <h1 className="text-3xl font-bold text-p1 mb-4">Apply for Program</h1>
      <p className="text-t-dark mb-6">You are applying for program ID: {id}</p>

      <button
        onClick={handleApply}
        disabled={loading}
        className="px-6 py-3 bg-p1 text-t-light font-semibold rounded-lg hover:bg-p1/80 transition disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Application"}
      </button>
    </div>
  );
}
