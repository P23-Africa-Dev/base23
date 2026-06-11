"use client";

import InputWithLabel from "@/components/input/InputWithLabel";
import { Button } from "@/components/ui/button";
import images from "@/constants/image";
import { Plus } from "lucide-react";
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

  const {
    register,
    handleSubmit,
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
    },
    mode: "onBlur",
  });

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
    <div className="w-full overflow-x-hidden">
      <div
        ref={stepContainerRef}
        className="relative z-7 mt-6 w-full overflow-x-hidden p-5 pb-48 md:mt-11 md:h-167.5 md:overflow-y-auto md:pb-5 lg:mt-3 lg:h-auto"
      >
        <div className="mx-auto max-w-md">
          {/* Heading */}
          <div className="mb-10">
            <h2 className="mb-1 text-2xl font-extrabold text-primary lg:text-3xl dark:text-black">
              First, Account Setup
            </h2>
            <p className="max-w-sm pr-20 text-[16px] font-normal text-primary lg:pr-5 lg:text-[17px]">
              Setup the account to gain endless smart matches with suitable
              professionals.
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
                href="/login"
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

      <Image
        src={images.bottomFormBgP}
        className="absolute top-[5%] z-2 h-auto w-full object-cover md:hidden"
        fill
        alt=""
      />
    </div>
  );
}
