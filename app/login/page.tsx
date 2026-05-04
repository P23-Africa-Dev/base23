"use client";

export const dynamic = "force-dynamic";

import LeftDesktopContent from "@/components/auths/LeftDesktopContent";
import MobileTopContent from "@/components/auths/MobileContent";
import { Checkbox } from "@/components/checkbox/Checkbox";
import InputWithLabel from "@/components/input/InputWithLabel";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui";
import images from "@/constants/image";
import AuthLayout from "@/layouts/auth-layout";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";

const loginMobileContent = {
  title: "We're glad to have you back.",
  description:
    "Log in to continue building connections and discover the endless opportunities awaiting you.",
  headingClassName: "text-2xl font-bold text-white",
  paragraphClassName: "max-w-sm pr-5 text-[14px] font-light text-white",
};

function Login() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    if (status) toast.success(status, { duration: 4000 });
  }, [status]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }
  };

  return (
    <>
      <AuthLayout
        title="Welcome Back!"
        subtitle="Log in to gain endless smart matches with suitable professionals."
        mobileTopContent={<MobileTopContent content={loginMobileContent} />}
        LeftDesktopContent={
          <LeftDesktopContent
            topContentLayout={
              <div className="max-w-77 mx-auto mt-[25%] w-fit pr-4">
                <h2 className="text-[36px] font-semibold text-[#F3F0E9]">
                  {" "}
                  Welcome Back!{" "}
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
                  Don’t have an account?{" "}
                  <a href="/register" className="font-medium italic">
                    Sign up
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
        <div className="w-full overflow-x-hidden">
          <form onSubmit={submit}>
            <InputWithLabel
              label="Email"
              htmlFor="email"
              type="email"
              required
              autoFocus
              tabIndex={1}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <InputWithLabel
              label="Password"
              htmlFor="password"
              type="password"
              required
              tabIndex={2}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-10.5 mb-6"
            />

            <div className="flex items-center justify-between px-2 text-sm font-medium text-primary dark:text-gray-300">
              <label className="flex cursor-pointer items-center gap-2 text-[16px] font-medium text-[#0B1727]">
                <Checkbox
                  id="remember"
                  name="remember"
                  checked={remember}
                  onClick={() => setRemember(!remember)}
                  //   className="h-4.5 w-4.5 border border-black accent-deepBlack dark:accent-white"
                />
                Remember for 30 days
              </label>
              <TextLink href="/forgot-password">Forgot Password</TextLink>
            </div>

            <Button
              type="submit"
              className="mt-10 mb-2 leading-6 w-full rounded-2xl text-[20px] bg-pinkLight py-[27px] text-lg font-semibold text-white hover:bg-pinkLight/90 dark:bg-blue-600 dark:hover:bg-blue-700"
              tabIndex={4}
            >
              Log in
            </Button>

            <div className="mt-0 flex justify-center">
              <p className="text-base font-light text-primary dark:text-gray-300">
                Don&apos;t have an account?{" "}
                <TextLink tabIndex={5} href="https://p23africa.com/brn-form">
                  Sign up
                </TextLink>
              </p>
            </div>
          </form>
        </div>
        <Image
          src={images.bottomFormBgP}
          className="absolute top-[1%] z-2 h-auto w-full object-cover md:hidden"
          fill
          alt=""
        />
      </AuthLayout>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
