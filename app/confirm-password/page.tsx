"use client";

export const dynamic = "force-dynamic";

import InputError from "@/components/input-error";
import InputWithLabel from "@/components/input/InputWithLabel";
import LeftDesktopContent from "@/components/auths/LeftDesktopContent";
import MobileTopContent from "@/components/auths/MobileContent";
import StepTopContent from "@/components/auths/StepTopContent";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/layouts/auth-layout";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

const confirmMobileContent = {
  title: "Confirm your Password",
  description:
    "This is a secure area of the application. Please confirm your password before continuing.",
  headingClassName: "text-3xl font-bold text-white",
  paragraphClassName: "max-w-sm pr-5 text-[17px] font-light text-white",
};

export default function ConfirmPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError("");
    try {
      await axios.post("/confirm-password", { password });
      window.history.back();
    } catch (err: any) {
      setError(err.response?.data?.errors?.password || "Incorrect password.");
      setPassword("");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AuthLayout
      mobileTopContent={<MobileTopContent content={confirmMobileContent} />}
      LeftDesktopContent={
        <LeftDesktopContent
          topContentLayout={
            <StepTopContent
              title="Confirm your Password"
              description="This is a secure area of the application. Please confirm your password before continuing."
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
              label="Password"
              htmlFor="password"
              type="password"
              autoComplete="current-password"
              value={password}
              autoFocus
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputError message={error} className="mt-2" />
          </div>

          <Button
            type="submit"
            className="w-full rounded-2xl bg-pinkLight py-[27px] text-lg font-semibold text-white hover:bg-pinkLight/90 dark:bg-blue-600 dark:hover:bg-blue-700"
            disabled={processing}
          >
            {processing && (
              <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
            )}
            Confirm password
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
