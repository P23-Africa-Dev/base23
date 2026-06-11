"use client";

export const dynamic = "force-dynamic";

import InputError from "@/components/input-error";
import TextLink from "@/components/text-link";
import InputWithLabel from "@/components/input/InputWithLabel";
import LeftDesktopContent from "@/components/auths/LeftDesktopContent";
import MobileTopContent from "@/components/auths/MobileContent";
import StepTopContent from "@/components/auths/StepTopContent";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/layouts/auth-layout";
import { LoaderCircle } from "lucide-react";
import axios from "axios";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const forgotMobileContent = {
  title: "Forgot your Password",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
  headingClassName: "text-3xl font-bold text-white",
  paragraphClassName: "max-w-sm pr-5 text-[17px] font-light text-white",
};

function ForgotPassword() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "";

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    try {
      await axios.post("/forgot-password", { email });
      window.location.href = `/forgot-password?status=We+have+emailed+your+password+reset+link`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.errors?.email || "Something went wrong.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AuthLayout
      mobileTopContent={<MobileTopContent content={forgotMobileContent} />}
      LeftDesktopContent={
        <LeftDesktopContent
          topContentLayout={
            <StepTopContent
              title="Forgot your Password ?"
              description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
              headingClassName="max-w-[100px] lg:max-w-[300px]"
            />
          }
        />
      }
    >
      <div className="w-full overflow-x-hidden">
        <form onSubmit={submit} className="space-y-7">
          {status && (
            <div className="mb-4 text-center text-sm font-medium text-green-600">
              {status}
            </div>
          )}

          <div>
            <InputWithLabel
              label="Email Address"
              htmlFor="email"
              type="email"
              name="email"
              autoComplete="off"
              value={email}
              autoFocus
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
            <InputError message={error} className="mt-2" />
          </div>

          <div className="w-full text-center">
            <span>Or, return to</span>
            <TextLink className="ml-2" href="/login">
              log in
            </TextLink>
          </div>

          <Button
            type="submit"
            className="mt-4 w-full rounded-2xl bg-pinkLight py-[27px] text-lg font-semibold text-white hover:bg-pinkLight/90 dark:bg-blue-600 dark:hover:bg-blue-700"
            tabIndex={4}
            disabled={processing}
          >
            {processing && (
              <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
            )}
            Email password reset link
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPassword />
    </Suspense>
  );
}
