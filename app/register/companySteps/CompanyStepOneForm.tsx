"use client";

import InputWithLabel from "@/components/input/InputWithLabel";
import { Button } from "@/components/ui/button";
import images from "@/constants/image";
import { Eye, EyeOff, Plus } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

export type CompanyStepOneData = {
  company_name: string;
  website: string;
  industry: string;
  country: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  countries_of_operation: string[];
};

type CompanyStepOneProps = {
  defaultValues: {
    company_name?: string;
    website?: string;
    industry?: string;
    country?: string;
    name?: string;
    position?: string;
    email?: string;
    phone?: string;
    password?: string;
    password_confirmation?: string;
    countries_of_operation?: string[];
  };
  onNext: (data: CompanyStepOneData) => void;
};

export default function CompanyStepOneForm({
  defaultValues,
  onNext,
}: CompanyStepOneProps) {
  const stepContainerRef = useRef<HTMLDivElement | null>(null);

  const [countries, setCountries] = useState<string[]>(
    defaultValues.countries_of_operation?.length
      ? defaultValues.countries_of_operation
      : ["Nigeria", "Egypt"],
  );
  const [addingCountry, setAddingCountry] = useState(false);
  const [newCountry, setNewCountry] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [meterVisible, setMeterVisible] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Omit<CompanyStepOneData, "countries_of_operation">>({
    defaultValues: {
      company_name: defaultValues.company_name || "",
      website: defaultValues.website || "",
      industry: defaultValues.industry || "",
      country: defaultValues.country || "",
      name: defaultValues.name || "",
      position: defaultValues.position || "",
      email: defaultValues.email || "",
      phone: defaultValues.phone || "",
      password: defaultValues.password || "",
      password_confirmation: defaultValues.password_confirmation || "",
    },
    mode: "onBlur",
  });

  const password = watch("password");

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

  const scrollToTop = useCallback(() => {
    if (stepContainerRef.current) {
      stepContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [scrollToTop]);

  const addCountry = () => {
    const value = newCountry.trim();
    if (value && !countries.includes(value)) {
      setCountries((prev) => [...prev, value]);
    }
    setNewCountry("");
    setAddingCountry(false);
  };

  const removeCountry = (value: string) => {
    setCountries((prev) => prev.filter((c) => c !== value));
  };

  const onSubmit = (
    data: Omit<CompanyStepOneData, "countries_of_operation">,
  ) => {
    scrollToTop();
    onNext({ ...data, countries_of_operation: countries });
  };

  return (
    <div className="w-full relative overflow-x-hidden min-h-[50vh]">
      <div
        ref={stepContainerRef}
        className="relative z-7 mt-6 w-full overflow-x-hidden p-5 pb-32 md:mt-11 md:h-167.5 md:overflow-y-auto md:pb-5 lg:mt-3 lg:h-auto"
      >
        <div className="mx-auto max-w-md">
          {/* Heading */}
          <div className="mb-10">
            <h2 className="mb-1 text-2xl font-extrabold text-primary lg:text-3xl dark:text-black">
              First, Account Setup
            </h2>
            <p className="max-w-sm pr-20 text-[16px] font-normal text-primary lg:pr-5 lg:text-[17px]">
              Set up your hiring account to find verified sales agents and post
              roles with confidence.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-7 md:mr-6"
          >
            <div className="grid grid-cols-1 gap-5.75 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
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
              <div>
                <InputWithLabel
                  label="Website"
                  htmlFor="website"
                  type="text"
                  {...register("website")}
                />
              </div>
            </div>

            <div>
              <InputWithLabel
                label="Industry"
                htmlFor="industry"
                type="text"
                {...register("industry", { required: "Industry is required" })}
              />
              {errors.industry && (
                <p className="mt-1 ml-3 text-sm text-red-500">
                  {errors.industry.message}
                </p>
              )}
            </div>

            <div>
              <InputWithLabel
                label="Country of headquarters"
                htmlFor="country"
                type="text"
                {...register("country", { required: "Country is required" })}
              />
              {errors.country && (
                <p className="mt-1 ml-3 text-sm text-red-500">
                  {errors.country.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5.75 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              <div>
                <InputWithLabel
                  label="Contact Name"
                  htmlFor="name"
                  type="text"
                  {...register("name", { required: "Contact name is required" })}
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
                  htmlFor="position"
                  type="text"
                  {...register("position")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5.75 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              <div>
                <InputWithLabel
                  label="Email Address"
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
              <div>
                <InputWithLabel
                  label="Phone Number"
                  htmlFor="phone"
                  type="tel"
                  {...register("phone")}
                />
              </div>
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

            {/* Country of Operation */}
            <div className="space-y-3 px-4">
              <h4 className="text-base font-semibold text-primary dark:text-black">
                Country of Operation
              </h4>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {countries.map((country) => (
                  <button
                    type="button"
                    key={country}
                    onClick={() => removeCountry(country)}
                    title="Remove"
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={images.checkedBadge}
                      alt=""
                      width={28}
                      height={28}
                      className="h-7 w-7"
                    />
                    <span className="text-base font-medium text-primary dark:text-black">
                      {country}
                    </span>
                  </button>
                ))}

                {addingCountry ? (
                  <input
                    autoFocus
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    onBlur={addCountry}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCountry();
                      }
                    }}
                    placeholder="Country name"
                    className="h-10 w-40 rounded-[20px] border-2 border-[#6D6D6D] px-4 text-sm outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingCountry(true)}
                    className="ml-auto flex items-center gap-2 text-grayLight hover:text-primary"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-base">Add more</span>
                  </button>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="mt-11 flex flex-col items-center">
              <Button
                type="submit"
                className="w-full rounded-2xl bg-pinkLight py-8 text-lg font-semibold text-white hover:bg-pinkLight/90"
              >
                Proceed
              </Button>
            </div>
          </form>

          {/* Login/Signups */}
          <div className="mt-10 w-full px-4 text-left md:hidden lg:px-0">
            <p className="mb-1 pl-10 text-base font-extralight">
              Already have an account?{" "}
              <a
                href="/login?type=company"
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
