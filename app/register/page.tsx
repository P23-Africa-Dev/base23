"use client";

export const dynamic = "force-dynamic";

import LeftDesktopContent from "@/components/auths/LeftDesktopContent";
import MobileTopContent from "@/components/auths/MobileContent";
import AuthLayout from "@/layouts/auth-layout";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import CompanyStepOneForm from "./companySteps/CompanyStepOneForm";
import CompanyStepTwoForm from "./companySteps/CompanyStepTwoForm";
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
  website: string;
  industry: string;
  categories: string[];
  great_at: string[];
  can_help_with: string[];
  visibilitySettings?: boolean[];
  phone: string;
  linkedin: string;
  country: string;
  countries_of_operation: string[];
  position: string;
  role: string;
  years_of_operation: string;
  number_of_employees: string;
  business_based: string;
  hiring_field_sales: string;
  budget_per_hire: string;
  selected_outcome: string;
  goals: string;
  year_established: string;
  tier?: string;
};

type AccountType = "agent" | "company";

type StepKey = "account" | "interests" | "companyAccount" | "questions";

const FLOWS: Record<AccountType, StepKey[]> = {
  agent: ["account", "interests"],
  company: ["companyAccount", "questions"],
};

const STEP_LABELS: Record<StepKey, string> = {
  account: "Account Info",
  interests: "Interests",
  companyAccount: "Account Info",
  questions: "Questions",
};

const MOBILE_CONTENT: Record<
  StepKey,
  {
    title: string;
    description: string;
    headingClassName: string;
    paragraphClassName: string;
  }
> = {
  account: {
    title: "First, the essential",
    description: "This helps members recognise and trust you.",
    headingClassName: "text-3xl font-bold text-white",
    paragraphClassName: "max-w-sm pr-20 text-[14px] font-light text-white",
  },
  interests: {
    title: "What is your secret sauce",
    description: "Members will search for this skills!",
    headingClassName: "text-2xl leading-6 pr-10 font-bold text-white",
    paragraphClassName: "max-w-sm  text-[14px]! font-light text-gray-300",
  },
  companyAccount: {
    title: "First, the essential",
    description: "This helps members recognise and trust you.",
    headingClassName: "text-3xl font-bold text-white",
    paragraphClassName: "max-w-sm pr-20 text-[14px] font-light text-white",
  },
  questions: {
    title: "Provide response appropriately",
    description: "Answer a few quick questions to stand out.",
    headingClassName: "text-2xl leading-6 pr-10 font-bold text-white",
    paragraphClassName: "max-w-sm  text-[14px]! font-light text-gray-300",
  },
};

const DESKTOP_HEADINGS: Record<StepKey, React.ReactNode> = {
  account: <>Let&apos;s get you started! </>,
  interests: (
    <>
      <div className="font-light">Almost There!</div>
      <div>Superpowers</div>
    </>
  ),
  companyAccount: <>Let&apos;s get you started! </>,
  questions: (
    <>
      <div className="font-light">Almost There!</div>
      <div>Standout!</div>
    </>
  ),
};

function RegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const accountType: AccountType =
    searchParams.get("type") === "company" ? "company" : "agent";
  const step = Number(searchParams.get("step") || 1);

  const [formData, setFormData] = useState<Partial<RegisterForm>>({});

  const flow = FLOWS[accountType];
  const stepKey: StepKey = flow[step - 1] ?? flow[0];
  const steps = flow.map((key) => STEP_LABELS[key]);

  const goToStep = (newStep: number) => {
    router.push(`/register?type=${accountType}&step=${newStep}`);
  };

  const nextStep = (data: Partial<RegisterForm>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    if (step >= flow.length) {
      router.push(accountType === "company" ? "/login" : "/dashboard");
    } else {
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
            content={flow.map((key) => MOBILE_CONTENT[key])}
          />
        }
        LeftDesktopContent={
          <LeftDesktopContent
            topContentLayout={
              <div className="max-w-77 mx-auto mt-[5%] w-fit pr-4">
                <h2 className="text-[36px] max-w-68 leading-10 mb-3.5 font-semibold text-[#F3F0E9]">
                  {DESKTOP_HEADINGS[stepKey]}
                </h2>
                <p className="text-[13px] max-w-69.75 text-[#F3F0E9] mb-4.75 tracking-[0.5px]">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor
                </p>
              </div>
            }
            bottomContent={
              <div className="w-fit text-base mx-auto  my-[15%] pr-10">
                <p className="mb-1 font-light">
                  Already have an account?{" "}
                  <a href="/login" className="font-medium italic">
                    Sign In
                  </a>
                </p>
                <p>
                  <a
                    href="/help"
                    className="font-medium italic hover:underline dark:text-deepBlack"
                  >
                    Need Help?
                  </a>
                </p>
              </div>
            }
          />
        }
      >
        {stepKey === "account" && (
          <StepOneForm
            defaultValues={{
              company_name: formData.company_name,
              name: formData.name,
              role: formData.role,
              email: formData.email,
              password: formData.password,
              password_confirmation: formData.password_confirmation,
            }}
            onNext={(data) => nextStep(data)}
          />
        )}

        {stepKey === "interests" && (
          <StepThreeForm
            defaultValues={{
              great_at: formData.great_at,
              can_help_with: formData.can_help_with,
            }}
            onNext={(data) => nextStep(data)}
          />
        )}

        {stepKey === "companyAccount" && (
          <CompanyStepOneForm
            defaultValues={{
              company_name: formData.company_name,
              website: formData.website,
              industry: formData.industry,
              country: formData.country,
              name: formData.name,
              position: formData.position,
              email: formData.email,
              phone: formData.phone,
              countries_of_operation: formData.countries_of_operation,
            }}
            onNext={(data) => nextStep(data)}
          />
        )}

        {stepKey === "questions" && (
          <CompanyStepTwoForm
            defaultValues={{
              business_based: formData.business_based,
              number_of_employees: formData.number_of_employees,
              hiring_field_sales: formData.hiring_field_sales,
              budget_per_hire: formData.budget_per_hire,
            }}
            onNext={(data) => nextStep(data)}
          />
        )}
      </AuthLayout>
    </>
  );
}

export default function Register() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}
