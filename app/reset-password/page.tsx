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
      <div className="w-full p-8 lg:overflow-y-auto">
        <div className="relative z-10 mx-auto max-w-md">
          <div className="mb-10">
            <h2 className="mb-1 text-2xl font-extrabold text-primary lg:text-3xl dark:text-black">
              Reset your Password
            </h2>
            <p className="max-w-sm pr-5 text-[17px] font-normal text-primary dark:text-black">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor
            </p>
          </div>

          <div className="max-w-sm">
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
                  className="w-full rounded-2xl border-2 border-deepBlack py-7 pl-10 font-semibold text-gray-900 ring-1 outline-none"
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
                  className="w-full rounded-2xl border-2 border-deepBlack py-7 pl-10 font-semibold text-gray-900 ring-1 outline-none"
                />
                <InputError
                  message={errors.password_confirmation}
                  className="mt-2"
                />
              </div>

              <Button
                type="submit"
                className="mt-10 w-full rounded-2xl bg-primary py-8 text-lg font-semibold text-white hover:bg-pinkLight/90 dark:bg-black"
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
        </div>
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
