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
import { submitRegistration } from "@/services/networkValidation";
import RegistrationLoader from "@/components/auths/RegistrationLoader";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

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
    description: "This helps companies recognise and trust you as an agent.",
    headingClassName: "text-3xl font-bold text-white",
    paragraphClassName: "max-w-sm pr-20 text-[14px] font-light text-white",
  },
  interests: {
    title: "What markets do you cover?",
    description: "Companies search for agents by industry and strengths.",
    headingClassName: "text-2xl leading-6 pr-10 font-bold text-white",
    paragraphClassName: "max-w-sm  text-[14px]! font-light text-gray-300",
  },
  companyAccount: {
    title: "First, the essential",
    description: "Tell us about your company so agents can trust you.",
    headingClassName: "text-3xl font-bold text-white",
    paragraphClassName: "max-w-sm pr-20 text-[14px] font-light text-white",
  },
  questions: {
    title: "A few hiring details",
    description: "Help us match you with the right sales agents.",
    headingClassName: "text-2xl leading-6 pr-10 font-bold text-white",
    paragraphClassName: "max-w-sm  text-[14px]! font-light text-gray-300",
  },
};

const DESKTOP_HEADINGS: Record<StepKey, React.ReactNode> = {
  account: <>Let&apos;s get you started! </>,
  interests: (
    <>
      <div className="font-light">Almost There!</div>
      <div>Your strengths</div>
    </>
  ),
  companyAccount: <>Let&apos;s get you started! </>,
  questions: (
    <>
      <div className="font-light">Almost There!</div>
      <div>Hiring details</div>
    </>
  ),
};

const DESKTOP_DESCRIPTIONS: Record<AccountType, string> = {
  agent:
    "Create your sales agent profile to get matched with companies hiring across Africa.",
  company:
    "Create your hiring account to find verified sales agents ready for your markets.",
};

function RegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const accountType: AccountType =
    searchParams.get("type") === "company" ? "company" : "agent";
  const step = Number(searchParams.get("step") || 1);

  const [formData, setFormData] = useState<Partial<RegisterForm>>({});
  const { refresh } = useAuth();
  const [registerStatus, setRegisterStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  const flow = FLOWS[accountType];
  const stepKey: StepKey = flow[step - 1] ?? flow[0];
  const steps = flow.map((key) => STEP_LABELS[key]);

  const goToStep = (newStep: number) => {
    router.push(`/register?type=${accountType}&step=${newStep}`);
  };

  const nextStep = async (data: Partial<RegisterForm>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    if (step >= flow.length) {
      setRegisterStatus('uploading');
      
      const fd = new FormData();
      Object.entries(updatedData).forEach(([key, val]) => {
        if (val === undefined || val === null) return;
        if (val instanceof File) {
          fd.append(key, val);
        } else if (Array.isArray(val)) {
          val.forEach((item) => fd.append(`${key}[]`, String(item)));
        } else if (typeof val === 'object') {
          fd.append(key, JSON.stringify(val));
        } else {
          fd.append(key, String(val));
        }
      });
      
      fd.append('account_type', accountType);

      try {
        const response = await submitRegistration(fd, {
          onProgress: (progress) => {
            setUploadProgress(progress);
            if (progress >= 100) {
              setRegisterStatus('processing');
            }
          },
        });

        if (response.success) {
          // Allow middleware through while session cookie settles from the proxy
          if (typeof document !== "undefined") {
            document.cookie =
              "base23_authenticated=true; path=/; max-age=2592000; SameSite=Lax; Secure";
          }
          setRegisterStatus('success');
        } else {
          setRegisterStatus('error');
          const msg =
            response.error?.message ||
            'Registration failed. Please try again.';
          // Surface proxy/misconfig 404s clearly instead of a blank Next error
          if (
            typeof msg === 'string' &&
            (msg.toLowerCase().includes('could not be found') ||
              msg.toLowerCase().includes('not found'))
          ) {
            toast.error(
              'Registration service is temporarily unreachable. Please try again in a moment.',
            );
          } else {
            toast.error(msg);
          }
          setTimeout(() => setRegisterStatus('idle'), 3000);
        }
      } catch (err: any) {
        setRegisterStatus('error');
        toast.error(err.message || 'An unexpected error occurred.');
        setTimeout(() => setRegisterStatus('idle'), 3000);
      }
    } else {
      goToStep(step + 1);
    }
  };

  const handleComplete = async () => {
    try {
      await refresh();
    } catch (err) {
      console.error('Session refresh failed after registration:', err);
    }
    router.push('/dashboard');
  };

  if (registerStatus !== 'idle') {
    return (
      <RegistrationLoader
        status={registerStatus}
        uploadProgress={uploadProgress}
        onComplete={handleComplete}
      />
    );
  }

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
                  {DESKTOP_DESCRIPTIONS[accountType]}
                </p>
              </div>
            }
            bottomContent={
              <div className="w-fit text-base mx-auto  my-[15%] pr-10">
                <p className="mb-1 font-light">
                  Already have an account?{" "}
                  <a
                    href={`/login?type=${accountType}`}
                    className="font-medium italic"
                  >
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
              password: formData.password,
              password_confirmation: formData.password_confirmation,
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
