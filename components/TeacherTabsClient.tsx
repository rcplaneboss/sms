"use client";
import { useState } from "react";
import TeacherApplicationForm from "./TeacherApplicationForm";
import TeacherAccountForm from "./TeacherAccountForm";
import TeacherProfileForm from "./TeacherProfileForm";
import Lottie from "lottie-react";


type Props = {
  vacancyId: string;
};

export default function TeacherRegister({ vacancyId }: Props) {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAccountRegSucc, setIsAccountRegSucc] = useState(false);

  return (
    // {step === 4 && (
    //   <Lottie
    //     animationData={require("../public/animations/success.json")}
    //     loop={false}
    //     className="w-48 h-48 mx-auto"
    //   />
    // )}
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
        <>
          <div className="text-center p-6 w-full">
            <h2 className="text-2xl font-bold text-p1-hex">
              <Lottie
                animationData={require("../public/animations/confetti.json")}
                loop={false}
                autoPlay={true}
                className="w-full h-48 mx-auto "
              />
              🎉 Registration Complete!
            </h2>
            <p className="text-sm text-gray-600">
              Your teacher profile and application have been submitted. You will
              receive an email with further instructions.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
