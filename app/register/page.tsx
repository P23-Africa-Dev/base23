"use client";

export const dynamic = "force-dynamic";

import LeftDesktopContent from "@/components/auths/LeftDesktopContent";
import MobileTopContent from "@/components/auths/MobileContent";
import StepTopContent from "@/components/auths/StepTopContent";
import AuthLayout from "@/layouts/auth-layout";
import { useEffect, useState } from "react";
import StepOneForm from "./stepForms/StepOneForm";
import StepThreeForm from "./stepForms/StepThreeForm";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  profile_picture: File | null;
  company_name: string;
  company_description: string;
  industry: string;
  categories: string[];
  great_at: string[];
  can_help_with: string[];
  visibilitySettings?: boolean[];
  phone: string;
  linkedin: string;
  country: string;
  position: string;
  years_of_operation: string;
  number_of_employees: string;
  selected_outcome: string;
  goals: string;
  year_established: string;
  tier?: string;
};

type PrefillData = {
  name?: string;
  email?: string;
  company_name?: string;
  industry?: string;
  phone?: string;
  linkedin?: string;
  country?: string;
  position?: string;
  years_of_operation?: string;
  number_of_employees?: string;
  selected_outcome?: string;
  goals?: string;
  categories?: string[];
  reg_number?: string;
  website?: string;
  offer_value?: string;
  b2b_interest?: string;
  year_established?: string;
  tier?: string;
};

type RegisterProps = {
  prefill?: PrefillData;
};

const topContentPerStep = [
  {
    title: "Let's get you started!",
    description:
      "Welcome! You're just a few steps away from getting everything set up. We've made the process simple and quick.",
  },
  {
    title: "Company Snapshot",
    description:
      "A quick glimpse of your company. Let others see who you are, what you do, and why you matter.",
  },
  {
    title: "Almost There!",
    spanElement: "Superpowers",
    description:
      "Share your business superpowers and attract the partnerships or support you're looking for.",
    headingClassName: "max-w-[300px] font-light",
  },
];

const mobileTopContentPerStep = [
  {
    title: "First, the essential",
    description: "This helps members recognise and trust you.",
    headingClassName: "text-3xl font-bold text-white",
    paragraphClassName: "max-w-sm pr-20 text-[14px] font-light text-white",
  },
  {
    title: "Tell us about your company",
    description: "We'll use this to find your perfect matches",
    headingClassName: "text-2xl leading-5.5 font-bold text-white",
    paragraphClassName:
      "max-w-sm pr-5 text-[16px] leading-4 font-light text-gray-200",
  },
  {
    title: "What is your secret sauce",
    description: "Members will search for this skills!",
    headingClassName: "text-2xl leading-6 pr-10 font-bold text-white",
    paragraphClassName: "max-w-sm  text-[14px]! font-light text-gray-300",
  },
];

export default function Register() {
  const [step, setStep] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    return Number(new URLSearchParams(window.location.search).get("step") || 1);
  });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<RegisterForm>();

  useEffect(() => {
    const getStepFromUrl = () =>
      Number(new URLSearchParams(window.location.search).get("step") || 1);
    const handlePopState = () => setStep(getStepFromUrl());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const steps = ["Account Info", "Company Info", "Interests"];

  const goToStep = (newStep: number) => {
    setStep(newStep);
    const url = new URL(window.location.href);
    url.searchParams.set("step", String(newStep));
    window.history.pushState({}, "", url.toString());
  };

  const nextStep = (isFinalStep = false) => {
    if (!isFinalStep) {
      goToStep(step + 1);
    }
  };

  return (
    <>
      <AuthLayout
        mobileTopContent={
          <MobileTopContent
            steps={steps}
            step={step}
            content={mobileTopContentPerStep}
          />
        }
        LeftDesktopContent={
          <LeftDesktopContent
            topContentLayout={
              <StepTopContent
                steps={steps}
                currentStep={step}
                title={topContentPerStep[step - 1].title}
                spanElement={topContentPerStep[step - 1].spanElement}
                headingClassName={topContentPerStep[step - 1].headingClassName}
                description={topContentPerStep[step - 1].description}
              />
            }
          />
        }
      >
        {step === 1 && (
          <StepOneForm
            defaultValues={{
              name: formData?.name,
              email: formData?.email,
              password: formData?.password,
              password_confirmation: formData?.password_confirmation,
            }}
            onNext={() => nextStep()}
          />
        )}

        {step === 2 && (
          <StepThreeForm
            defaultValues={{
              great_at: formData?.great_at,
              can_help_with: formData?.can_help_with,
            }}
            onNext={() => nextStep(true)}
          />
        )}
      </AuthLayout>
    </>
  );
}
