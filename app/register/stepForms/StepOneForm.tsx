"use client";

import { Button } from "@/components/ui/button";
import InputWithLabel from "@/components/input/InputWithLabel";
import { Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

type Step1FormData = {
  company_name: string;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
};

type Step1Props = {
  defaultValues: {
    company_name?: string;
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    role?: string;
  };
  onNext: (data: Step1FormData) => void;
};

export default function StepOneForm({ defaultValues, onNext }: Step1Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [meterVisible, setMeterVisible] = useState(false);

  const stepContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step1FormData>({
    defaultValues: {
      company_name: defaultValues.company_name || "",
      name: defaultValues.name || "",
      email: defaultValues.email || "",
      password: defaultValues.password || "",
      password_confirmation: defaultValues.password_confirmation || "",
      role: defaultValues.role || "",
    },
    mode: "onBlur",
  });

  const password = watch("password");

  const scrollToTop = useCallback(() => {
    if (stepContainerRef.current) {
      stepContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [scrollToTop]);

  const onSubmit = (data: Step1FormData) => {
    scrollToTop();
    onNext(data);
  };

  const passwordRules = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[#?!@$%^&*-]/,
    length: /.{8,}/,
  };

  const getPasswordRules = (value: string) => [
    {
      label: "One uppercase letter",
      valid: passwordRules.uppercase.test(value),
    },
    {
      label: "One lowercase letter",
      valid: passwordRules.lowercase.test(value),
    },
    { label: "One number", valid: passwordRules.number.test(value) },
    {
      label: "One special character",
      valid: passwordRules.special.test(value),
    },
    {
      label: "At least 8 characters",
      valid: passwordRules.length.test(value),
    },
  ];

  return (
    <div className="w-full relative overflow-x-hidden min-h-[50vh]">
      <div
        ref={stepContainerRef}
        className="relative z-7 mt-6 w-full overflow-x-hidden p-5 pb-32 md:mt-11 md:h-167.5 md:overflow-y-auto md:pb-5 lg:mt-3 lg:h-auto"
      >
        <div className="mx-auto max-w-md">
          <div className="mb-10">
            <h2 className="mb-1 text-2xl font-extrabold text-primary lg:text-3xl dark:text-black">
              First, Account Setup
            </h2>
            <p className="max-w-sm pr-20 text-[16px] font-normal text-primary lg:pr-5 lg:text-[17px]">
              Set up your sales agent account to get matched with companies
              hiring across Africa.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-7 md:mr-6"
          >
            <div>
              <InputWithLabel
                label="Company Name"
                htmlFor="company_name"
                type="text"
                {...register("company_name", {
                  required: "Company name is required",
                })}
              />
              {errors.company_name && (
                <p className="mt-1 ml-3 text-sm text-red-500">
                  {errors.company_name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5.75 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              <div>
                <InputWithLabel
                  label="Full Name"
                  htmlFor="name"
                  type="text"
                  {...register("name", { required: "Full name is required" })}
                />
                {errors.name && (
                  <p className="mt-1 ml-3 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <InputWithLabel
                  label="Job Title"
                  htmlFor="role"
                  type="text"
                  placeholder="e.g. Field Sales Agent"
                  {...register("role", {
                    required: "Job title is required",
                  })}
                />
                {errors.role && (
                  <p className="mt-1 ml-3 text-sm text-red-500">
                    {errors.role.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <InputWithLabel
                label="Email"
                htmlFor="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 ml-3 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="relative">
                <InputWithLabel
                  label="Password"
                  htmlFor="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    validate: (value) => {
                      const rules = getPasswordRules(value);
                      const allValid = rules.every((r) => r.valid);
                      return (
                        allValid ||
                        "Password must meet all strength requirements"
                      );
                    },
                  })}
                  onFocus={() => setMeterVisible(true)}
                  onBlur={() => setMeterVisible(false)}
                  inputClassName="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1 ml-3 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}

              {meterVisible && password && (
                <div className="absolute z-10 h-[160px] w-full space-y-2 rounded-2xl bg-white px-5 py-4 shadow-2xl">
                  <div className="h-2 w-full rounded bg-gray-200">
                    <div
                      className={`h-full rounded transition-all duration-300 ${
                        [
                          "w-1/5 bg-red-500",
                          "w-2/5 bg-orange-500",
                          "w-3/5 bg-yellow-500",
                          "w-4/5 bg-blue-500",
                          "w-full bg-green-500",
                        ][
                          getPasswordRules(password).filter((r) => r.valid)
                            .length
                        ]
                      }`}
                    ></div>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {getPasswordRules(password).map((rule, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-2 ${rule.valid ? "text-green-600" : "text-gray-500"}`}
                      >
                        {rule.valid ? "✅" : "❌"} {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="relative">
              <InputWithLabel
                label="Confirm Password"
                htmlFor="password_confirmation"
                type={showConfirmPassword ? "text" : "password"}
                {...register("password_confirmation", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                inputClassName="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {errors.password_confirmation && (
                <p className="mt-1 ml-3 text-xs text-red-500">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            <div className="mt-11 flex flex-col items-center">
              <Button
                type="submit"
                className="w-full rounded-2xl bg-pinkLight py-8 text-lg font-semibold text-white hover:bg-pinkLight/90"
              >
                Proceed
              </Button>
            </div>
          </form>

          <div className="mt-10 w-full px-4 text-left md:hidden lg:px-0">
            <p className="mb-1 pl-10 text-base font-extralight">
              Already have an account?{" "}
              <a
                href="/login?type=agent"
                className="font-semibold text-deepBlack italic hover:underline dark:text-deepBlack"
              >
                Sign In
              </a>
            </p>
            <p className="pl-10 text-base">
              <a
                href="/help"
                className="font-bold text-deepBlack italic hover:underline dark:text-deepBlack"
              >
                Need Help?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
