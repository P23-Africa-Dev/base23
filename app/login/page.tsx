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
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "@/lib/axios-config";
import { useAuth } from "@/context/AuthContext";
import { LoaderCircle } from "lucide-react";
import ArrowRight from "@/public/assets/arrow-right.png";
import Building from "@/public/assets/building-02.png";
import AgentIcon from "@/public/assets/user-circle.png";

type AccountType = "company" | "agent";

const LOGIN_COPY: Record<
  AccountType,
  {
    title: string;
    subtitle: string;
    leftTitle: string;
    leftDescription: string;
    mobileTitle: string;
    mobileDescription: string;
    registerHref: string;
    forgotHref: string;
  }
> = {
  company: {
    title: "Welcome back, Hiring partner",
    subtitle:
      "Log in to find verified sales agents and manage your hiring pipeline.",
    leftTitle: "Welcome back, Hiring partner",
    leftDescription:
      "Sign in to post roles, browse agent profiles, and hire with confidence across your markets.",
    mobileTitle: "Welcome back, Hiring partner",
    mobileDescription:
      "Log in to continue hiring verified sales agents for your target markets.",
    registerHref: "/register?type=company",
    forgotHref: "/forgot-password?type=company",
  },
  agent: {
    title: "Welcome back, Sales Agent",
    subtitle:
      "Log in to connect with companies hiring and grow your opportunities.",
    leftTitle: "Welcome back, Sales Agent",
    leftDescription:
      "Sign in to manage your profile, get matched with hiring companies, and unlock new opportunities.",
    mobileTitle: "Welcome back, Sales Agent",
    mobileDescription:
      "Log in to continue building your profile and discovering companies that need you.",
    registerHref: "/register?type=agent",
    forgotHref: "/forgot-password?type=agent",
  },
};

const WRONG_DOOR_MESSAGE: Record<AccountType, string> = {
  company:
    "This account is registered as a Hiring (company) account. Please sign in here.",
  agent:
    "This account is registered as a Sales Agent account. Please sign in here.",
};

function buildLoginHref(
  type: AccountType,
  opts?: { redirect?: string | null; email?: string; status?: string },
) {
  const params = new URLSearchParams({ type });
  if (opts?.redirect) params.set("redirect", opts.redirect);
  if (opts?.email) params.set("email", opts.email);
  if (opts?.status) params.set("status", opts.status);
  return `/login?${params.toString()}`;
}

function LoginChooser({ redirect }: { redirect: string | null }) {
  const options = [
    {
      label: "Company",
      title: "Sign in as Hiring",
      description:
        "Access your hiring account to find verified sales agents and manage roles.",
      icon: (
        <Image
          src={Building}
          alt=""
          className="h-10 w-10 sm:h-13.75 sm:w-13.75 text-white mr-2"
        />
      ),
      iconBg: "bg-[#CD3072]",
      href: buildLoginHref("company", { redirect }),
    },
    {
      label: "Agent",
      title: "Sign in as Sales Agent",
      description:
        "Access your agent account to connect with companies hiring across Africa.",
      icon: (
        <Image
          src={AgentIcon}
          alt=""
          className="h-10 w-10 sm:h-13 sm:w-13 text-white mr-2"
        />
      ),
      iconBg: "bg-[#5054D4]",
      href: buildLoginHref("agent", { redirect }),
    },
  ];

  return (
    <AuthLayout
      title="Welcome back to Base 23"
      subtitle="Select which account you want to sign in with."
      LeftDesktopContent={
        <LeftDesktopContent
          topContentLayout={
            <div className="max-w-77 mx-auto mt-[25%] w-fit pr-4">
              <h2 className="text-[36px] font-extrabold text-[#F3F0E9]">
                Base 23
              </h2>
              <p className="text-[13px] max-w-69.75 text-[#F3F0E9] mb-4.75 tracking-[0.5px]">
                The referral network connecting hiring companies with verified
                sales agents across Africa.
              </p>
            </div>
          }
          bottomContent={
            <div className="w-fit text-base mx-auto my-[15%] pr-10">
              <p className="mb-1 font-light">
                Don&apos;t have an account?{" "}
                <Link href="/" className="font-medium italic">
                  Sign up
                </Link>
              </p>
              <p>
                <Link
                  href="/help"
                  className="font-medium italic hover:underline dark:text-deepBlack"
                >
                  Need Help?
                </Link>
              </p>
            </div>
          }
        />
      }
    >
      <div className="w-full max-w-124.25 px-5 md:px-8 flex flex-col gap-4 sm:gap-5 mt-6 sm:mt-8">
        {options.map((opt) => (
          <Link
            key={opt.title}
            href={opt.href}
            className="flex items-center gap-3 sm:gap-3.75 rounded-[20px] bg-[#0B1727] pr-4 sm:pr-8.25 pl-9 py-4 sm:py-5 cursor-pointer hover:bg-[#0d1e35] transition-colors group"
          >
            <div className="relative shrink-0">
              <div
                className={`flex h-20 w-18 sm:h-27.5 sm:w-25.25 items-center justify-center rounded-r-[50px] ${opt.iconBg}`}
              >
                {opt.icon}
              </div>
              <span
                className="absolute -left-1.5 top-0 bottom-0 -translate-x-full flex items-center justify-center text-[10px] sm:text-[12px] leading-6 font-light text-white/50 tracking-widest"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                {opt.label}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] leading-6 font-semibold text-white mb-1">
                {opt.title}
              </p>
              <p className="text-[12px] leading-4 text-[#F6F6F6]">
                {opt.description}
              </p>
            </div>

            <Image
              src={ArrowRight}
              alt="Arrow Right"
              className="shrink-0 self-baseline mt-1 h-5 w-5 text-[#F6F6F6] group-hover:text-white transition-colors"
            />
          </Link>
        ))}
      </div>
    </AuthLayout>
  );
}

function LoginForm({ accountType }: { accountType: AccountType }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "";
  const emailParam = searchParams.get("email") || "";
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const { refresh } = useAuth();
  const copy = LOGIN_COPY[accountType];

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status) toast.success(status, { duration: 4000 });
  }, [status]);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const submit = async (e: React.FormEvent) => {
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

    setLoading(true);
    try {
      await axios.post("/api/auth/login", {
        email: email.trim(),
        password,
        remember,
        account_type: accountType,
      });
      await refresh();
      toast.success("Successfully logged in.");
      router.push(redirectPath);
    } catch (err: any) {
      console.error("Login error:", err);
      const statusCode = err.response?.status;
      const data = err.response?.data;
      const actualType = data?.actual_account_type as AccountType | undefined;

      if (
        statusCode === 403 &&
        (actualType === "company" || actualType === "agent")
      ) {
        const message =
          data?.message || WRONG_DOOR_MESSAGE[actualType];
        toast.error(message, { duration: 5000 });
        router.replace(
          buildLoginHref(actualType, {
            redirect: searchParams.get("redirect"),
            email: email.trim(),
          }),
        );
        return;
      }

      const errorMessage =
        data?.message ||
        data?.error ||
        "Invalid credentials. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const mobileContent = {
    title: copy.mobileTitle,
    description: copy.mobileDescription,
    headingClassName: "text-2xl font-bold text-white",
    paragraphClassName: "max-w-sm pr-5 text-[14px] font-light text-white",
  };

  return (
    <AuthLayout
      title={copy.title}
      subtitle={copy.subtitle}
      mobileTopContent={<MobileTopContent content={mobileContent} />}
      LeftDesktopContent={
        <LeftDesktopContent
          topContentLayout={
            <div className="max-w-77 mx-auto mt-[25%] w-fit pr-4">
              <h2 className="text-[36px] font-semibold text-[#F3F0E9]">
                {copy.leftTitle}
              </h2>
              <p className="text-[13px] max-w-69.75 text-[#F3F0E9] mb-4.75 tracking-[0.5px]">
                {copy.leftDescription}
              </p>
            </div>
          }
          bottomContent={
            <div className="w-fit text-base mx-auto my-[15%] pr-10">
              <p className="mb-1 font-light">
                Don&apos;t have an account?{" "}
                <a href={copy.registerHref} className="font-medium italic">
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
              />
              Remember for 30 days
            </label>
            <TextLink href={copy.forgotHref}>Forgot Password</TextLink>
          </div>

          <Button
            type="submit"
            className="mt-10 mb-2 leading-6 w-full rounded-2xl text-[20px] bg-pinkLight py-[27px] text-lg font-semibold text-white hover:bg-pinkLight/90 dark:bg-blue-600 dark:hover:bg-blue-700"
            tabIndex={4}
            disabled={loading}
          >
            {loading && <LoaderCircle className="h-5 w-5 animate-spin mr-2" />}
            Log in
          </Button>

          <div className="mt-0 flex justify-center">
            <p className="text-base font-light text-primary dark:text-gray-300">
              Don&apos;t have an account?{" "}
              <TextLink tabIndex={5} href={copy.registerHref}>
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
  );
}

function Login() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const redirect = searchParams.get("redirect");
  const sessionExpired = searchParams.get("session_expired");
  const accountType: AccountType | null =
    typeParam === "company" || typeParam === "agent" ? typeParam : null;

  useEffect(() => {
    if (sessionExpired === "true") {
      toast.error("Your session has expired. Please sign in again.", {
        duration: 4000,
      });
    }
  }, [sessionExpired]);

  if (!accountType) {
    return <LoginChooser redirect={redirect} />;
  }

  return <LoginForm accountType={accountType} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
