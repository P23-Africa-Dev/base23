"use client";

export const dynamic = "force-dynamic";

import InputError from "@/components/input-error";
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

const resetMobileContent = {
  title: "Reset your Password",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
  headingClassName: "text-3xl font-bold text-white",
  paragraphClassName: "max-w-sm pr-5 text-[17px] font-light text-white",
};

function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    password_confirmation?: string;
  }>({});
  const [processing, setProcessing] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    try {
      await axios.post("/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      window.location.href = "/login?status=Password+reset+successfully";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErrors(err.response?.data?.errors || {});
    } finally {
      setProcessing(false);
      setPassword("");
      setPasswordConfirmation("");
    }
  };

  return (
    <AuthLayout
      mobileTopContent={<MobileTopContent content={resetMobileContent} />}
      LeftDesktopContent={
        <LeftDesktopContent
          topContentLayout={
            <StepTopContent
              title="Reset your Password"
              description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
              headingClassName="max-w-[100px] lg:max-w-[300px]"
            />
          }
        />
      }
    >
      <div className="w-full overflow-x-hidden">
        <form onSubmit={submit} className="space-y-7">
          <div>
            <InputWithLabel
              label="Email"
              htmlFor="email"
              type="email"
              autoComplete="email"
              value={email}
              readOnly
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputError message={errors.email} className="mt-2" />
          </div>

          <div>
            <InputWithLabel
              label="Password"
              htmlFor="password"
              type="password"
              autoComplete="new-password"
              value={password}
              autoFocus
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <InputWithLabel
              label="Confirm Password"
              htmlFor="password_confirmation"
              type="password"
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
            <InputError
              message={errors.password_confirmation}
              className="mt-2"
            />
          </div>

          <Button
            type="submit"
            className="mt-10 w-full rounded-2xl bg-pinkLight py-[27px] text-lg font-semibold text-white hover:bg-pinkLight/90 dark:bg-blue-600 dark:hover:bg-blue-700"
            tabIndex={4}
            disabled={processing}
          >
            {processing && (
              <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
            )}
            Reset password
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
