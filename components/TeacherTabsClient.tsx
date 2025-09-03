"use client";
import { useState } from "react";
import TeacherApplicationForm from "./TeacherApplicationForm";
import TeacherAccountForm from "./TeacherAccountForm";
import TeacherProfileForm from "./TeacherProfileForm";

type Props = {
  vacancyId: string;
};

export default function TeacherRegister({ vacancyId }: Props) {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAccountRegSucc, setIsAccountRegSucc] = useState(false);

  return (
    <div className="w-full max-w-lg">
      {/* Step 1: Account creation */}
      {step === 1 && (
        <TeacherAccountForm
          setIsAccountRegSucc={(v) => {
            setIsAccountRegSucc(v);
            if (v) setStep(2); // Move to profile creation
          }}
          setUserId={setUserId}
        />
      )}

      {/* Step 2: Profile creation */}
      {step === 2 && userId && (
        <TeacherProfileForm
          userId={userId}
          onComplete={() => setStep(3)} // Move to application
        />
      )}

      {/* Step 3: Application submission */}
      {step === 3 && userId && (
        <TeacherApplicationForm
          userId={userId}
          vacancyId={vacancyId}
          onComplete={() => setStep(4)} // Move to completion
        />
      )}

      {/* Step 4: Registration complete */}
      {step === 4 && (
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold text-p1-hex">
            🎉 Registration Complete!
          </h2>
          <p className="text-sm text-gray-600">
            Your teacher profile and application have been submitted.
          </p>
        </div>
      )}
    </div>
  );
}
