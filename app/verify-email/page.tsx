"use client";

export const dynamic = "force-dynamic";

import LeftDesktopContent from "@/components/auths/LeftDesktopContent";
import MobileTopContent from "@/components/auths/MobileContent";
import StepTopContent from "@/components/auths/StepTopContent";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/layouts/auth-layout";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const verifyMobileContent = {
  title: "Verify your Email",
  description:
    "Please verify your email address by clicking on the link we just emailed to you.",
  headingClassName: "text-3xl font-bold text-white",
  paragraphClassName: "max-w-sm pr-5 text-[17px] font-light text-white",
};

function VerifyEmail() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "";
  const [processing, setProcessing] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await axios.post("/email/verification-notification");
      window.location.href = "/verify-email?status=verification-link-sent";
    } finally {
      setProcessing(false);
    }
  };

  const logout = () => {
    axios.post("/logout").then(() => {
      window.location.href = "/login";
    });
  };

  return (
    <AuthLayout
      mobileTopContent={<MobileTopContent content={verifyMobileContent} />}
      LeftDesktopContent={
        <LeftDesktopContent
          topContentLayout={
            <StepTopContent
              title="Verify your Email"
              description="Please verify your email address by clicking on the link we just emailed to you."
              headingClassName="max-w-[100px] lg:max-w-[300px]"
            />
          }
        />
      }
    >
      <div className="w-full overflow-x-hidden">
        {status === "verification-link-sent" && (
          <div className="mb-6 text-center text-sm font-medium text-green-600">
            A new verification link has been sent to the email address you
            provided during registration.
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <Button
            type="submit"
            disabled={processing}
            className="w-full rounded-2xl bg-pinkLight py-[27px] text-lg font-semibold text-white hover:bg-pinkLight/90 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
            Resend verification email
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={logout}
              className="font-semibold text-[16px] italic text-[#0B1727] decoration-neutral-300 transition-colors duration-300 ease-out hover:underline hover:decoration-current"
            >
              Log out
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail />
    </Suspense>
  );
}
